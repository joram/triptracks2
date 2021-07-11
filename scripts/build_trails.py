#!/usr/bin/env python3
from trails import Trail
import pdb
import json
import os


manifest = {}
def add_to_manifest(trail:Trail):
    def _rec(d, path, val):
        if len(path) == 0:
            if "items" not in d:
                d["items"] = []
            d["items"].append(val)
            return d

        c = path[0]
        if c not in d:
            d[c] = {}
        d[c] = _rec(d[c], path[1:], val)
        return d

    global manifest
    manifest = _rec(manifest,trail.geohash, trail.title+".json")

for trail in Trail.load_all():
    if len(list(trail.waypoints)) > 0:
        geohash_path = '/'.join(list(trail.geohash))
        directory = f"./triptracks/public/trails/{geohash_path}"
        if not os.path.exists(directory):
            os.makedirs(directory)
        filepath = f"{directory}/{trail.title}.json"
        print(filepath)
        f = open(filepath, "w")
        f.write(json.dumps(trail.json, sort_keys=True, indent=2))
        add_to_manifest(trail)
f = open("./triptracks/public/trails/manifest.json", "w")
f.write(json.dumps(manifest, sort_keys=True, indent=2))

