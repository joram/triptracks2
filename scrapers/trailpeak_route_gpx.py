#!/usr/bin/env python
import os
from base import BaseScraper
from trailpeak_route_details import ScrapeTrailPeakDetails


class ScrapeTrailPeakGPX(BaseScraper):
    def __init__(self):
        BaseScraper.__init__(self)
        self.route_scraper = ScrapeTrailPeakDetails(False)
        self.base_url = "https://www.trailpeak.com/index.jsp?con=trail&val="
        self.wait = 0
        self.extension = "gpx"

    def item_urls(self):
        for route in self.route_scraper.json_items():
            url = route.get("gpx_url")
            print(url)
            yield url
            import time
            time.sleep(10)

    def _trail_id(self, gpx_url):
        gpx_url = gpx_url.replace("https://www.trailpeak.com/content/gpsData/gps", "")
        return int(gpx_url.split("-")[0])

    def item_cache_filepath(self, url):
        parts = url.strip("//n").split("/")
        return os.path.abspath(os.path.join(self.data_dir, f"./{parts[-1]}"))


if __name__ == "__main__":
    s = ScrapeTrailPeakGPX()
    s.debug = True
    for gpx_file in s.items():
        print(gpx_file)
