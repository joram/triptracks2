#!/usr/bin/env python
import dataclasses
import pprint
from typing import Optional

from scrapers.utils.opengraph import parse as parse_opengraph
from scrapers.utils.ld import parse as parse_ld
from scrapers.base import BaseScraper
import os
import json

from products.models.product import Spec, Product
from scrapers.utils.sitemap import get_sitemap_urls


class ScrapeSteepAndCheapJSON(BaseScraper):

    base_url = "https://www.steepandcheap.com/"
    wait = 0

    def __init__(self, debug=False):
        BaseScraper.__init__(self, debug)
        self._existing_files = None

    def item_urls(self):
        sitemap = get_sitemap_urls("https://www.steepandcheap.com/")
        for url in sitemap:
            yield url
    def get_product(self, url) -> Optional[Product]:
        filepath = self.item_cache_filepath(url).replace(".html", ".json")
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                data = json.load(f)
                return Product(**data)

        soup = self.get_soup(url)
        product = parse_ld(soup)
        if product is None:
            return None

        def _get_specs():
            specsDiv = soup.find("div", {"data-id": "techSpecsSection"})
            if not specsDiv:
                return []

            dts = specsDiv.findAll("dt")
            dds = specsDiv.findAll("dd")
            specs = []
            for dt, dd in zip(dts, dds):
                specs.append(Spec(
                    key=dt.text.strip(),
                    value=dd.text.strip(),
                ))
            return specs

        product.specs = _get_specs()

        with open(filepath, "w") as f:
            json.dump(dataclasses.asdict(product), f, indent=2, sort_keys=True)
        return product

    def products(self):
        for url in self.item_urls():
            product = self.get_product(url)
            if product is not None:
                yield product


if __name__ == "__main__":
    s = ScrapeSteepAndCheapJSON()
    i = 0
    for item in s.products():
        print(f"{i}\t {item.price_cents/100}".ljust(10), item.name, item.url)

        filepath = os.path.join(s.data_dir, f"../../products/data/steep_and_cheap/{item.slug}.json")
        filepath = os.path.abspath(filepath)
        directory = os.path.dirname(filepath)
        os.makedirs(directory, exist_ok=True)

        if not os.path.exists(filepath):
            with open(filepath, "w") as f:
                json.dump(dataclasses.asdict(item), f, indent=2, sort_keys=True)
        i += 1
