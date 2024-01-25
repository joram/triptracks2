#!/usr/bin/env python3
import difflib
import json
import os
from difflib import SequenceMatcher
from products.models.product import Product, Spec

_MANIFEST = None


def _get_manifest():
    global _MANIFEST

    if _MANIFEST is None:
        curr_dir = os.path.dirname(os.path.realpath(__file__))
        manifest_filepath = os.path.join(curr_dir, "./products_manifest.json")

        products = {}
        with open(manifest_filepath) as f:
            manifest = json.loads(f.read())
            for product in manifest:
                product = Product(
                    name=product["title"],
                    description="",
                    url=product["url"],
                    price_cents=0,
                    img_hrefs=[],
                    specs=[Spec(key=w["key"], value=w["value"]) for w in product["weights"]],
                )
                products[product.name.lower()] = product
        _MANIFEST = products

    return _MANIFEST


def _find_match(item_name):
    """Find the best match for the given category and item name."""
    item_name = item_name.lower()

    if item_name == "1.5l water":
        return Product(
            name="1.5L Water",
            description="h2o, the essence of life",
            url="",
            price_cents=0,
            img_hrefs=[],
            specs=[Spec(key="weight", value="1500g")],
        )

    manifest = _get_manifest()
    for key, product in manifest.items():
        if item_name in key:
            if product.weight is not None:
                return product

    results = difflib.get_close_matches(item_name, manifest.keys(), n=10)
    for result in results:
        if manifest[result].weight is not None:
            return manifest[result]

    if len(results) > 0:
        name = results[0]
        return manifest[name]
    else:
        return None

    # if len(results) == 0:
    #     item_name_words = item_name.split(" ")
    #     item_name_words = [word.lower().strip() for word in item_name_words if word.lower() != "the"]
    #     results = []
    #     for word in item_name_words:
    #         l = difflib.get_close_matches(word, manifest.keys(), n=10)
    #         results += l
    #     if len(results) > 0:
    #         name = max(results, key=results.count)
    #         return manifest[name]


def _get_lines(csv_file):
    with open(csv_file) as f:
        lines = f.readlines()
        lines = [line.strip() for line in lines]
        lines = [line.split(",") for line in lines]
        for line in lines[1:]:
            category = line[0].strip()
            short_name = line[1].strip()
            full_name = line[2].strip()
            quantity = float(line[3].strip())
            weight = None
            if len(line) > 4:
                weight = float(line[4])
            yield category, short_name, full_name, quantity, weight


def flesh_out_csv(csv_file):
    """Flesh out the CSV file with the missing data."""
    total_weight = 0
    category_weights = {}
    for (category, short_name, full_name, quantity, weight) in _get_lines(csv_file):
        product = _find_match(full_name)
        product_weight = ""
        if product is not None:
            product_weight = product.weight

        if weight is None and product_weight != "":
            weight = product_weight

        product_url = product.url if product else ""
        print(f"{category.ljust(20)} {short_name.ljust(20)}\t{weight} x {quantity}  {product_url}")
        if weight is not None:
            total_weight += weight*quantity
            if category not in category_weights:
                category_weights[category] = 0
            category_weights[category] += weight*quantity
    print(f"Total weight: {int(total_weight*100)/100}")
    weight_on_back = 0
    for category, weight in category_weights.items():
        weight = int(weight*100)/100
        print(f"\t{category.ljust(20)} {weight}")
        if category not in ["Skiing"]:
            weight_on_back += weight

    kg = weight_on_back/1000
    kg = int(kg*100)/100
    print(f"weight on back is: {kg}kg")

curr_dir = os.path.dirname(os.path.realpath(__file__))
csv_file = os.path.join(curr_dir, "./example.csv")
flesh_out_csv(csv_file)
