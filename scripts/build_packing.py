#!/usr/bin/env python3
import json

from items import Item

items = []
for item in Item.load_mec():
    if item.weight:
        data = item.json()
        items.append({
            "weight": item.weight,
            "name": item.name,
            "image": item.img_urls["low"][0],
        })
        print(item.name)

with open("./web/public/packing.search.mec.json", "w") as f:
    f.write(json.dumps(items, indent=2, sort_keys=True))