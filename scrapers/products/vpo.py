#!/usr/bin/env python
import atexit
import dataclasses
import json
import os
import pprint

from scrapers.base import BaseScraper
from products.models.product import Spec, Product
from scrapers.utils.sitemap import get_sitemap_urls
from scrapers.utils.opengraph import parse as parse_og
from scrapers.products.utils.searchspring import search as searchspring_search

vpo_searchspring_site_id = "2elsq3"


class VPOScraper(BaseScraper):

    def __init__(self):
        super().__init__()
        self.wait = 0
        self.sold_out = []
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        filepath = f"./vpo_sold_out.json"
        self.sold_out_filepath = os.path.abspath(os.path.join(curr_dir, filepath))
        if os.path.exists(self.sold_out_filepath):
            with open(self.sold_out_filepath, "r") as f:
                self.sold_out = json.load(f)

    def products(self):
        def _get_specs(product):
            soup = self.get_soup(product.url)
            spec_p = soup.find("p", {"id": "specsId"})
            if spec_p is not None:
                specs = []
                content = str(spec_p)
                content = content.replace("<br>", "\n")
                content = content.replace("<br/>", "\n")
                content = content.replace("<p id=\"specsId\">", "")
                content = content.replace("</p>", "")
                lines = content.split("\n")
                for line in lines:
                    if ":" in line:
                        parts = line.split(":")
                        key = parts[0].strip("* ")
                        value = parts[1].strip().split("/")[0].strip()
                        if value == "":
                            continue
                        specs.append(Spec(key=key, value=value))
                product.specs = specs


        page = 1
        while True:
            for product in searchspring_search("", site_id=vpo_searchspring_site_id, page=page):
                _get_specs(product)
                yield product, product.url
            page += 1


if __name__ == "__main__":
    i = 0
    s = VPOScraper()
    for item, url in s.products():
        if item is None:
            print(f"{i}\t None\t {url}")
            i +=1
            continue

        filepath = os.path.join(s.data_dir, f"../../products/data/vpo/{item.slug}.json")
        filepath = os.path.abspath(filepath)
        directory = os.path.dirname(filepath)
        os.makedirs(directory, exist_ok=True)

        print(f"{i}\t {item.weight}\t{item.name}\t {url}")
        with open(filepath, "w") as f:
            json.dump(dataclasses.asdict(item), f, indent=2, sort_keys=True)
        i += 1
