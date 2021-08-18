#!/usr/bin/env python3
import json
import os

import pygeohash

trail_search = []


def _create_trail_search(trail: dict):
    trail_search.append({
        "title": trail["title"],
        "image": trail["photos"][0] if len(trail["photos"]) > 0 else None,
        "url": f"/trail/{trail['center_geohash']}",
    })


def process_trails():
    i = 0
    directory = "./web/public/trail_details/"
    filenames = os.listdir(directory)
    for filename in filenames:
        with open(os.path.join(directory, filename)) as f:
            data = json.loads(f.read())
            _create_trail_search(data)
            print(f"{i}/{len(filenames)} {data['title']}")
            i += 1

    with open("./web/public/trails.search.json", "w") as f:
        f.write(json.dumps(trail_search, sort_keys=True, indent=2))


process_trails()
