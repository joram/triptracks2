#!/usr/bin/env python
import json
import os
from base import BaseScraper, FailedRequest
from bs4 import BeautifulSoup
from utils.lines import lines_from_gpx_string, geohash, bbox

import django
django.setup()

from apps.routes.models.route_metadata import RouteMetadata


class ScrapeTrailPeakRawHTML(BaseScraper):

    def __init__(self):
        BaseScraper.__init__(self)
        self.base_url = "https://www.trailpeak.com/index.jsp?con=trail&val="

    def item_urls(self):
        for i in range(1, 14000):
            yield f"https://www.trailpeak.com/index.jsp?con=trail&val={i}"

    def item_content(self, url):
        return self.get_content(url)

    def item_cache_filepath(self, url):
        id = int(url.replace(self.base_url, ""))
        id = str(id).rjust(5, "0")
        return os.path.abspath(os.path.join(self.data_dir, "./{}.html".format(id)))


class ScrapeTrailPeakDetails(BaseScraper):

    def __init__(self, debug=False):
        BaseScraper.__init__(self)
        self.html_scraper = ScrapeTrailPeakRawHTML()
        self.html_scraper.debug = debug
        self.debug = debug
        self.base_url = "https://www.trailpeak.com/index.jsp?con=trail&val="
        self.wait = 0

    def item_urls(self):
        for i in range(1, 100000):
            yield f"https://www.trailpeak.com/index.jsp?con=trail&val={i}"

    def get_uncached_content(self, url):
        trail_id = url.replace(self.base_url, "")
        html = self.html_scraper.item_content(url)
        if "Sorry, the trail you request could not be found" in html:
            return json.dumps({})
        bs = BeautifulSoup(html, features="lxml")

        description = ""
        descDiv = bs.find("div", {"id": "description"})
        if descDiv is not None:
            for p in descDiv.findAll("p"):
                description += p.text
            description = description.rstrip("Advertisement:")

        directions = ""
        if "Directions:" in description:
            parts = description.split("Directions:")
            if len(parts) > 2:
                # TODO: handle this situation
                return json.dumps({})
                
            description, directions = parts

        name = "trail: {}".format(trail_id)
        subheading = ""
        try:
            name = bs.find("div", {"class": "TableHeader"}).find("h1").text.strip("\n ")
            subheading = bs.find("div", {"class": "TableHeader"}).find("h2").text.strip("\n ")
        except:
            pass

        mountain_name = ""
        try:
            mountain_name = bs.find("div", {"class": "TableHeader"}).find("h2").text
        except:
            pass

        image_url = ""
        try:
            gallery = bs.find("div", {"id": "imageGallery"})
            src = gallery.find("img").attrs["src"]
            image_url = f"https://www.trailpeak.com/{src}"
        except:
            pass

        gpx_filename = ""
        for line in html.split("\n"):
            if "GPX_URL" in line:
                parts = line.split("\"")
                filename = parts[1]
                extension = ".gpx"
                if filename.lower().endswith(".gpx"):
                    extension = ""
                gpx_filename = f"gps{trail_id}-{parts[1]}{extension}"
                break

        details = {
            "description": description,
            "directions": directions,
            "name": name,
            "mountain_name": mountain_name,
            "subheading": subheading,
            "trail_image_url": image_url,
            "url": url,
            "metadata": self.get_metadata(bs),
            "gpx_url": f"https://www.trailpeak.com/content/gpsData/{gpx_filename}",
        }
        return json.dumps(details, sort_keys=True, indent=4, separators=(',', ': '))

    def item_cache_filepath(self, url):
        id = int(url.replace(self.base_url, ""))
        id = str(id).rjust(5, "0")
        return os.path.abspath(os.path.join(self.data_dir, "./{}.json".format(id)))


if __name__ == "__main__":
    from trailpeak_route_gpx import ScrapeTrailPeakGPX
    i = 0
    s = ScrapeTrailPeakDetails(False)
    s_gpx = ScrapeTrailPeakGPX()
    for route in s.json_items():
        if route.get("name") is None:
            continue

        rm = None
        try:
            rm = RouteMetadata.objects.get(name=route.get("name"))
            rm.source_url = route.get("url")
            rm.source = "trailpeak"
            rm.description = route.get("description")
            rm.save()
        except RouteMetadata.DoesNotExist:
            if "waypoint.gpx" in route.get("gpx_url"):
                continue
            try:
                gpx_content = ScrapeTrailPeakGPX().get_content(route.get("gpx_url"))
            except FailedRequest:
                print(f'failed to get gpx file for {route.get("name")}\t{route.get("gpx_url")}')
                continue

            try:
                lines = lines_from_gpx_string(gpx_content)
                rm = RouteMetadata.objects.create(
                    name=route.get("name"),
                    geohash=geohash(bbox(lines)),
                    bounds=bbox(lines),
                    description=route.get("description"),
                    source_url=route.get("url"),
                    source="trailpeak",
                )
                import pprint
                pprint.pprint(vars(rm))
            except Exception as e:
                print(e)
                print("error for: ", route.get("url"))

        if rm is not None:
            print(f"{i}\t{rm.name}")

        i += 1
