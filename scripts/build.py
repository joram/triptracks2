#!/usr/bin/env python3
import json
import os
import time

import pygeohash
from geojson import dump
from trails import Peak, Trail

manifest = {}
trails_per_peak = {}
trail_search = []


def _create_trail_manifest(trail: Trail):
    def _rec(d, path, val):
        if len(path) == 0:
            if "items" not in d:
                d["items"] = []
            d["items"].append(val)
            d["items"] = list(set(d["items"]))
            return d

        c = path[0]
        if c not in d:
            d[c] = {}
        d[c] = _rec(d[c], path[1:], val)
        return d

    global manifest
    manifest = _rec(manifest, trail.geohash, trail.center_geohash+".geojson")


def _create_geojson(trail: Trail):
    directory = f"./web/public/trails"
    if not os.path.exists(directory):
        os.makedirs(directory)
    filepath = f"{directory}/{trail.center_geohash}.geojson"
    with open(filepath, "w") as f:
        dump(trail.geojson(), f)


def _create_json_details(trail: Trail):
    directory = f"./web/public/trail_details"
    if not os.path.exists(directory):
        os.makedirs(directory)
    filepath = f"{directory}/{trail.center_geohash}.json"
    data = trail.json(skinny=True)
    with open(filepath, "w") as f:
        f.write(json.dumps(data, sort_keys=True, indent=2))


def _create_trail_search(trail: Trail):
    trail_search.append({
        "title": trail.title,
        "image": trail.photos[0] if len(trail.photos) > 0 else None,
        "url": f"/trail/{trail.center_geohash}",
    })


def process_trails():
    i = 0
    total = Trail.count()
    for trail in Trail.load_all():
        if len(list(trail.waypoints)) > 0:
            _create_geojson(trail)
            _create_json_details(trail)
            _create_trail_search(trail)
            _create_trail_manifest(trail)
            print(f"{i}/{total} {trail.title}")
            i += 1
        time.sleep(0)

    with open("./web/public/trails.manifest.json", "w") as f:
        f.write(json.dumps(manifest, sort_keys=True, indent=2))

    with open("./web/public/trails.search.json", "w") as f:
        f.write(json.dumps(trail_search, sort_keys=True, indent=2))


def process_peaks():

    peak_trails = {}
    trails_directory = f"./web/public/trails"
    for filename in os.listdir(trails_directory):
        path = os.path.join(trails_directory, filename)
        with open(path) as f:
            try:
                trail = json.loads(f.read())
            except:
                continue
            nearest_peak_geohash = trail["nearest_peak_geohash"]
            if nearest_peak_geohash not in peak_trails:
                peak_trails[nearest_peak_geohash] = []
            peak_trails[nearest_peak_geohash].append(trail["center_geohash"])

    trail_count = 0
    most_trails_peak = None

    i = 0
    peaks = list(Peak.all_peaks())
    for peak in peaks:
        directory = f"./web/public/peaks"
        if not os.path.exists(directory):
            os.makedirs(directory)
        filepath = f"{directory}/{peak.geohash}.json"
        peak_data = peak.json
        peak_data["trails"] = peak_trails.get(peak.geohash, [])
        if len(peak_data["trails"]) > 0:
            print(f"{i}/{len(peaks)} {filepath} {json.dumps(peak_data)}")
            with open(filepath, "w") as f:
                f.write(json.dumps(peak_data, sort_keys=True, indent=2))
        if len(peak_data["trails"]) > trail_count:
            trail_count = len(peak_data["trails"])
            most_trails_peak = peak
        i += 1

    print(trail_count, most_trails_peak.geohash)


def build_heatmap():
    trails_directory = f"./web/public/trails"
    with open(f"{trails_directory}/../../src/trails.heatmap.jsx", "w") as f:
        f.write("let trailHeatmap = [\n")
        for filename in os.listdir(trails_directory):
            if filename.endswith(".geojson"):
                geohash = filename.split(".")[0]
                print(geohash)
                (lat, lng) = pygeohash.decode(geohash)
                f.write(f"  new window.map.LatLng({lat}, {lng}),\n")
        f.write(f"]\n")
        f.write(f"export default trailHeatmap;\n")


def build_heatmap_geojson():
    trails_directory = f"./web/public/trails"
    with open(f"./web/public/trails.heatmap.geojson", "w") as f:
        f.write("""{
    "type": "FeatureCollection",
    "name": "trails",
    "features": [\n""")
        first = True
        for filename in os.listdir(trails_directory):
            if filename.endswith(".geojson"):
                if not first:
                    f.write(",\n")
                first = False
                geohash = filename.split(".")[0]
                print(geohash)
                (lat, lng) = pygeohash.decode(geohash)
                f.write(json.dumps({"type": "Feature", "packing_list_id": geohash, "geometry": {"type": "Point", "coordinates": [lng, lat]}}))
        f.write("]\n}")


process_trails()
build_heatmap_geojson()
# process_peaks()
