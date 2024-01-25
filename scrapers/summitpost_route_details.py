#!/usr/bin/env python
import json
import os
import cssutils
from bs4 import BeautifulSoup
from scrapers.base import BaseScraper
from scrapers.summitpost_mountain_routes_list import ScrapeSummitPostMountainRoutesList
from scrapers.summitpost_base import BaseSummitPostScraper
from tt_api.utils.lines import lines_from_gpx_string, geohash, bbox

import django
django.setup()

from apps.routes.models.route_metadata import RouteMetadata


class ScrapeSummitPostRouteRawHTML(BaseScraper):

    def __init__(self, debug=False):
        BaseScraper.__init__(self)
        self.debug = debug
        self.base_url = "https://www.summitpost.org/undefined-behaviour/"

    def item_urls(self):
        for i in range(1, 14000):
            yield "{}{}".format(self.base_url, i)

    def item_content(self, url):
        html = self.get_content(url)
        return html

    def item_cache_filepath(self, url):
        id = url.split("/")[-1].replace("\\'", "")
        id = int(id)
        id = str(id).rjust(5, "0")
        return os.path.abspath(os.path.join(self.data_dir, "./{}.html".format(id)))


class ScrapeSummitPostRouteDetails(BaseSummitPostScraper):

    def __init__(self, debug=False):
        BaseScraper.__init__(self, debug)
        self.routes_list_scraper = ScrapeSummitPostMountainRoutesList()
        self.route_html_scraper = ScrapeSummitPostRouteRawHTML()
        self.base_url = "https://www.summitpost.org/"

    def item_urls(self):
        for list_urls in self.routes_list_scraper.json_items():
            for route_url in list_urls:
                yield route_url

    def item_cache_filepath(self, url):
        id = int(url.split("/")[-1].replace("\\'", ""))
        id = str(id).rjust(5, "0")
        return os.path.abspath(os.path.join(self.data_dir, "./{}.json".format(id)))

    def get_uncached_content(self, url):
        html = self.route_html_scraper.item_content(url)
        if "This page has been deleted." in html:
            return json.dumps({})

        bs = BeautifulSoup(html, features="lxml")
        if bs.find("div", {"class": "full-content"}) is None:
            return json.dumps({})

        name = bs.find("h1", {"class": "adventure-title"}).string
        breadcrumbs = bs.find("ul", {"class": "breadcrumbs"})
        mountain_name = breadcrumbs.find_all("li")[1].find("a").text
        gpx_file = self._details(bs).get("gpx file")

        # clarify generic names
        if name.lower() in ["west ridge"]:
            name = f"{name} of {mountain_name}"

        cover_image_div = bs.find("div", {"class": "cover-image"})
        div_style = cover_image_div['style']
        style = cssutils.parseStyle(div_style)
        trail_image_url = style['background-image'].lstrip("url(").rstrip(")")
        description = self._description(bs)

        details = {
            "description": description.get("Route Description"),
            "directions": description.get("Approach"),
            "suggested_gear": description.get("Essential Gear"),
            "gpx_url": gpx_file,
            "metadata": self._details(bs),
            "name": name,
            "subheading": "",
            "trail_image_url": trail_image_url,

            "url": url,
            "mountain_name": mountain_name,
        }
        return json.dumps(details)


if __name__ == "__main__":
    from summitpost_route_gpx import ScrapeSummitPostRouteGPX
    s = ScrapeSummitPostRouteDetails(False)
    s_gpx = ScrapeSummitPostRouteGPX()
    for route in s.json_items():
        try:
            rm = RouteMetadata.objects.get(name=route.get("title"))
            if rm.source != "summitpost":
                if rm.source_url is not None and "summitpost" in rm.source_url:
                    rm.source = "summitpost"
                    rm.save()
                    continue
                print(f"{rm.name} comes from both sources")
                continue
        except RouteMetadata.DoesNotExist:
            gpx_file = route.get("details", {}).get("gpx file")
            if gpx_file:
                import pprint
                pprint.pprint(route)
                gpx_content = s_gpx.get_content(gpx_file)
                lines = lines_from_gpx_string(gpx_content)
                rm = RouteMetadata.objects.create(
                    name=route.get("name"),
                    geohash=geohash(bbox(lines)),
                    bounds=bbox(lines),
                    description=route.get("description"),
                    source_url=route.get("url"),
                    source="summitpost",
                )
