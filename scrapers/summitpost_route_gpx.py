#!/usr/bin/env python
import json
import os
from base import BaseScraper
from summitpost_route_details import ScrapeSummitPostRouteDetails


class ScrapeSummitPostRouteGPX(BaseScraper):

    def __init__(self, debug=True):
        BaseScraper.__init__(self, debug)
        self.details_scraper = ScrapeSummitPostRouteDetails(False)
        self.base_url = "https://www.summitpost.org/"

    def item_urls(self):
        i = 0
        for url in self.details_scraper.item_urls():
            details = self.details_scraper.get_content(url)
            details = json.loads(details)
            gpx_file = details.get("details", {}).get("gpx file")
            print(i, "\t", gpx_file)
            if gpx_file is not None:
                yield gpx_file
            i += 1

    def item_cache_filepath(self, url):
        filename = url.split("=")[-1].replace("\\'", "")
        return os.path.abspath(os.path.join(self.data_dir, filename))


if __name__ == "__main__":
    s = ScrapeSummitPostRouteGPX(False)
    print("running gpx scraper")
    for url in s.item_urls():
        s.get_content(url)
    print("ran")

