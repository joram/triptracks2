#!/usr/bin/env python3
import dataclasses
import pprint

import requests

from products.models.product import Product

vpo_searchspring_site_id = "2elsq3"
import requests


def search(search_term, site_id, page=1, results_per_page=24):
    url = f"https://{site_id}.a.searchspring.io/api/search/search.json?resultsFormat=json&siteId={site_id}&resultsPerPage={results_per_page}&page={page}&redirectResponse=direct&3Fsearchterm={search_term}"
    headers = {"accept": "application/json"}
    response = requests.get(url, headers=headers)
    items = response.json()["results"]

    for item in items:
        product = Product(
            name=item["name"],
            description=item.get("description"),
            url="https://vpo.ca"+item["url"],
            price_cents=int(float(item["price"])*100),
            img_hrefs=[item["imageUrl"]],
            specs=[],
        )
        yield product