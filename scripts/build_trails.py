#!/usr/bin/env python3
from trails import Trail
import pdb
import json


for trail in Trail.load_all():
    print(trail.title)
    if len(list(trail.waypoints)) > 0:
        f = open(f"./triptracks/public/trails/{trail.title}.json", "w")
        f.write(json.dumps(trail.json, sort_keys=True, indent=2))
