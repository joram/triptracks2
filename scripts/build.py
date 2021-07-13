#!/usr/bin/env python3
import time

from trails import Peak, Trail
import json
import os

manifest = {}
trails_per_peak = {}


def add_trail_to_manifest(trail:Trail):
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
    manifest = _rec(manifest, trail.geohash, trail.center_geohash+".json")


def process_trails():
    i = 0
    total = Trail.count()
    for trail in Trail.load_all():
        try:
            if len(list(trail.waypoints)) > 0:
                directory = f"./triptracks/public/trails"
                if not os.path.exists(directory):
                    os.makedirs(directory)
                filepath = f"{directory}/{trail.center_geohash}.json"
                print(f"{i}/{total} {filepath}")
                f = open(filepath, "w")
                data = trail.json
                f.write(json.dumps(data, sort_keys=True, indent=2))
                add_trail_to_manifest(trail)
                i += 1
            time.sleep(0)
        except Exception as e:
            print(e)
    f = open("./triptracks/public/trails.manifest.json", "w")
    f.write(json.dumps(manifest, sort_keys=True, indent=2))


def process_peaks():

    peak_trails = {}
    trails_directory = f"./triptracks/public/trails"
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
        directory = f"./triptracks/public/peaks"
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


process_trails()
process_peaks()
