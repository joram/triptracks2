#!/usr/bin/env python
import os
from base import BaseScraper
import json
from bs4 import BeautifulSoup
from summitpost_mountain_details import ScrapeSummitPostMountainDetails
from summitpost_base import BaseSummitPostScraper


class ScrapeSummitPostMountainRoutesListRawHTML(BaseScraper):

    def __init__(self):
        BaseScraper.__init__(self)
        self.mountain_details_scraper = ScrapeSummitPostMountainDetails()

    def item_urls(self):
        for mountain in self.mountain_details_scraper.json_items():
            if "routes_url" in mountain:
                if self.debug:
                    print(f'Mountain: {mountain.get("title")}')
                yield mountain.get("routes_url")

    def item_content(self, url):
        return self.get_content(url)

    def item_cache_filepath(self, url):
        params = url.split("/")
        name = params[-2]
        id = params[-1]
        cache_path = os.path.abspath(os.path.join(self.data_dir, f"./mountain_routes_{name}_{id}.html"))
        return cache_path


class ScrapeSummitPostMountainRoutesList(BaseSummitPostScraper):

    def __init__(self, debug=False):
        BaseScraper.__init__(self)
        self.raw_html_scraper = ScrapeSummitPostMountainRoutesListRawHTML()
        self.mountain_details_scraper = ScrapeSummitPostMountainDetails()
        self.raw_html_scraper.debug = debug
        self.mountain_details_scraper.debug = debug
        self.debug = debug
        self._current_mountain = None

    def item_urls(self):
        for mountain in self.mountain_details_scraper.json_items():
            if self.debug:
                print(f'Mountain: {mountain.get("title")}')
            if mountain.get("routes_url") is not None:
                self._current_mountain = mountain
                yield mountain.get("routes_url")

    def get_uncached_content(self, url):
        html = self.raw_html_scraper.item_content(url)
        soup = BeautifulSoup(html, features="lxml")
        return json.dumps(self._list_item_urls(soup))

    def item_cache_filepath(self, url):
        params = url.split("/")
        name = params[-2]
        id = params[-1]
        cache_path = os.path.abspath(os.path.join(self.data_dir, f"./mountain_routes_{name}_{id}.json"))
        return cache_path


if __name__ == "__main__":
    s = ScrapeSummitPostMountainRoutesList()
    for routes in s.json_items():
        import pprint
        pprint.pprint(routes)
