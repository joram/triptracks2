#!/usr/bin/env python
from scrapers.summitpost_route_details import ScrapeSummitPostRouteDetails
from scrapers.trailpeak_route_details import ScrapeTrailPeakDetails


def routes_generator():
    scrapers = [
        (ScrapeTrailPeakDetails().json_items(), "trailpeak"),
        (ScrapeSummitPostRouteDetails().json_items(), "summitpost"),
    ]

    i = 0
    while len(scrapers) > 0:
        scraper, source = scrapers[i % len(scrapers)]
        route = scraper.__next__()
        yield route, source
        i += 1
