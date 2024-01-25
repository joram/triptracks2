#!/usr/bin/env python
import os
import json
from base import BaseScraper
from bs4 import BeautifulSoup
from summitpost_mountains_list import ScrapeSummitPostMountainsList
from summitpost_base import BaseSummitPostScraper


class ScrapeSummitPostMountainRawHTML(BaseScraper):

    def __init__(self):
        BaseScraper.__init__(self)

    def item_cache_filepath(self, url):
        params = url.split("/")
        name = params[-2]
        id = params[-1]
        cache_path = os.path.abspath(os.path.join(self.data_dir, f"./mountain_{name}_{id}.html"))
        return cache_path


class ScrapeSummitPostMountainDetails(BaseSummitPostScraper):

    def __init__(self):
        BaseScraper.__init__(self)
        self.list_mountains_scraper = ScrapeSummitPostMountainsList()
        self.mountain_raw_html_scraper = ScrapeSummitPostMountainRawHTML()

    def item_urls(self):
        for mountain_urls in self.list_mountains_scraper.json_items():
            for mountain_url in mountain_urls:
                yield mountain_url

    def get_uncached_content(self, url):
        html = self.mountain_raw_html_scraper.get_content(url)
        soup = BeautifulSoup(html, features="lxml")
        headings_div = soup.find("div", {"class": "headings"})

        details = {
            "url": url,
            "title": self._title(soup),
            "description": self._description(soup),
            "details": self._details(soup),
        }

        for a in headings_div.find_all("a"):
            href = a.attrs["href"]
            if "/routes/" in href:
                parts = url.split("/")
                mountain_id = parts[-1]
                routes_url = f"https://www.summitpost.org/object_list.php?parent_id={mountain_id}&canonical=1&object_type=2&map_2=1"
                details["routes_url"] = routes_url

        return json.dumps(details)

    def item_cache_filepath(self, url):
        params = url.split("/")
        name = params[-2]
        id = params[-1]
        return os.path.abspath(os.path.join(
            self.data_dir,
            f"./mountain_{name}_{id}.html",
        ))


if __name__ == "__main__":
    s = ScrapeSummitPostMountainDetails()
    for mountain in s.json_items():
        print(
            mountain.get("title").ljust(40),
            "routes_url" in mountain.keys(),
            mountain.get("url").rjust(70),
        )
