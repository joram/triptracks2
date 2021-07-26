#!/usr/bin/env python3
import json

from items.product import Product

items = []
for product in Product.load_mec():
    if product.weight:
        data = product.json()
        items.append({
            "weight": product.weight,
            "name": product.name,
            "image": product.img_urls["low"][0],
        })
        print(product.name)

with open("./triptracks/public/packing.search.mec.json", "w") as f:
    f.write(json.dumps(items, indent=2, sort_keys=True))