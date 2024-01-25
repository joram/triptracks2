#!/usr/bin/env python
import dataclasses
import json
import os
from typing import Optional

from products.models.product import Product, Spec
from scrapers.base import BaseScraper
from scrapers.utils.sitemap import get_sitemap_urls
from scrapers.utils.ld import parse as parse_ld


class REIScraper(BaseScraper):

    base_url = "https://www.rei.com"

    def item_urls(self):
        for url in ["https://www.rei.com/product/161912/black-diamond-whippet-ski-pole-single"]:
            yield url
        sitemap = get_sitemap_urls("https://www.rei.com/sitemap.xml")
        for url in sitemap:
            if "/product/" in url:
                yield url

    def get_product(self, url) -> Optional[Product]:
        filepath = self.item_cache_filepath(url).replace(".html", ".json")  # shouldn't be json, should be html
        if os.path.exists(filepath):
            with open(filepath, "r") as f:
                data = json.load(f)
                return Product(**data)

        soup = self.get_soup(url)
        product = parse_ld(soup)

        tech_specs_table = soup.find("table", {"class": "tech-specs"})
        for tr in tech_specs_table.find_all("tr"):
            th = tr.find("th")
            td = tr.find("td")
            ps = td.find_all("p")
            for p in ps:
                product.specs.append(
                    Spec(key=th.text.strip(), value=p.text.strip())
                )

        with open(filepath, "w") as f:
            json.dump(dataclasses.asdict(product), f, indent=2, sort_keys=True)

        return product

    def products(self):
        for url in self.item_urls():
            product = self.get_product(url)
            if product is None:
                continue
            yield product


if __name__ == "__main__":
    scraper = REIScraper()
    i = 0
    for product in scraper.products():
        print(f"product {i}: {product.name}\t{product.url}")
        i += 1
        curr_dir = os.path.dirname(os.path.abspath(__file__))
        filepath = f"../../products/data/rei/{product.slug}.json"
        filepath = os.path.abspath(os.path.join(curr_dir, filepath))
        filedir = os.path.dirname(filepath)
        os.makedirs(filedir, exist_ok=True)
        with open(filepath, "w") as f:
            json.dump(dataclasses.asdict(product), f, indent=2, sort_keys=True)
