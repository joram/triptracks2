#!/usr/bin/env python
import os
from base import BaseScraper
import json
from bs4 import BeautifulSoup


class ScrapeSummitPostMountainsListRawHTML(BaseScraper):

    def __init__(self):
        BaseScraper.__init__(self)

    def item_urls(self):
        url = "https://www.summitpost.org/object_list.php?" \
              "distance_lat_1=48.4993&distance_lon_1=-123.4003&" \
              "map_1=1&object_type=1&orderby=distance&page={}"
        for page in range(1, 608):
            yield url.format(page)

    def item_content(self, url):
        html = self.get_content(url)
        return html

    def item_cache_filepath(self, url):
        params = url.split("&")
        for param in params:
            k, v = param.split("=")
            if k == "page":
                page = v
                page = str(int(page)).rjust(5, "0")
                return os.path.abspath(os.path.join(self.data_dir, f"./mountains_page_{page}.html"))


class ScrapeSummitPostMountainsList(BaseScraper):

    def __init__(self):
        BaseScraper.__init__(self)
        self.raw_html_scraper = ScrapeSummitPostMountainsListRawHTML()

    def item_urls(self):
        for url in self.raw_html_scraper.item_urls():
            yield url

    def get_uncached_content(self, url):
        html = self.raw_html_scraper.item_content(url)
        soup = BeautifulSoup(html, features="lxml")
        peak_urls = []
        cci_thumbs = soup.find_all("a", {"class": "cci-thumb"})
        for thumb in cci_thumbs:
            href = thumb.attrs["href"].replace("\'/", "").replace("\\'", "").replace("\\", "")
            url = self.base_url + href
            peak_urls.append(f"https://www.summitpost.org/{url}")
        return json.dumps(peak_urls)

    def item_cache_filepath(self, url):
        params = url.split("&")
        for param in params:
            k, v = param.split("=")
            if k == "page":
                page = v.rjust(5, "0")
                return os.path.abspath(os.path.join(self.data_dir, f"./mountains_page_{page}.json"))


if __name__ == "__main__":
    s = ScrapeSummitPostMountainsList()
    print("running details scraper")
    i = 0
    for url in s.item_urls():
        data = s.get_content(url)
        print("raw data:", data)
        data = json.loads(data)
        print(data)
