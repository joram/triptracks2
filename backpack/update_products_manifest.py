#!/usr/bin/env python
import json
import os


def update_products_manifest():
    """
    This function updates the products manifest file with the latest product urls.
    """

    def get_weights(data):
        weights = []
        for spec in data["specs"]:
            if "weight" in spec["key"].lower():
                weights.append(spec)
        return weights

    manifest = []
    curr_dir = os.path.dirname(os.path.realpath(__file__))
    site_names = os.listdir(os.path.join(curr_dir, "../products/data"))
    for site_name in site_names:
        dir_path = os.path.join(curr_dir, "../products/data/", site_name)
        for filename in os.listdir(dir_path):
            filepath = os.path.join(dir_path, filename)
            if not os.path.isfile(filepath):
                continue
            with open(filepath) as f:
                data = f.read()
                data = json.loads(data)
                weights = get_weights(data)
                manifest.append({
                    "title": data["name"],
                    "url": data["url"],
                    "weights": weights,
                })

    with open(os.path.join(curr_dir, "./products_manifest.json"), "w") as f:
        f.write(json.dumps(manifest, indent=2, sort_keys=True))


update_products_manifest()
