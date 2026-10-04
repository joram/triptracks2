#!/usr/bin/env python3
"""Write the slim gear catalog the packing search fetches on demand.

Keeps only what the search and packing lists use (title, image, weights) from
products/products_manifest.json, so the browser downloads ~3 MB instead of ~13 MB.
"""
import json

with open("./products/products_manifest.json") as f:
    products = json.load(f)

catalog = [
    {"title": p["title"], "image": p.get("image") or None, "weights": p.get("weights") or []}
    for p in products
    if p.get("title")
]

with open("./web/public/packing.catalog.json", "w") as f:
    json.dump(catalog, f, separators=(",", ":"))

print(f"wrote {len(catalog)} products")
