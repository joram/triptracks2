import json
import os
from typing import List

import gpxpy


class Trail:
    def __init__(self, title, description, directions, photos, source_url, stats, geohash, gpx_filepath):
        self.title = title.replace("/", "-")
        self.description = description
        self.directions = directions
        self.photos = photos
        self.source_url = source_url
        self.stats = stats
        self.gpx_filepath = gpx_filepath
        self.geohash = geohash
        self._gpx_content = None

    @property
    def json(self):
        return {
            "title": self.title,
            "waypoints": list(self.waypoints),
            "geohash": self.geohash,
        }

    @property
    def gpx_data(self) -> str:
        if self._gpx_content is None:
            with open(self.gpx_filepath) as f:
                try:
                    self._gpx_content = f.read()
                except:
                    return ""
        return self._gpx_content

    @property
    def waypoints(self):
        data = self.gpx_data
        try:
            gpx = gpxpy.parse(data)
        except:
            return
        for track in gpx.tracks:
            for segment in track.segments:
                for point in segment.points:
                    yield {
                        "lat": point.latitude,
                        "lng": point.longitude,
                        "alt": point.elevation,
                    }

    @classmethod
    def load_all(cls) -> List["Trail"]:
        dir_path = os.path.dirname(os.path.realpath(__file__))
        data_dir = f"{dir_path}/data"
        for filename in os.listdir(data_dir):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(data_dir, filename)
            gpx_filepath = filepath.replace(".json", ".gpx")
            f = open(filepath)
            data = json.loads(f.read())
            try:
                trail = Trail(
                    title=data["title"],
                    description=data["description"],
                    directions=data["directions"],
                    photos=data["photos"],
                    source_url=data["source_url"],
                    stats=data["stats"],
                    geohash=data["geohash"],
                    gpx_filepath=gpx_filepath,
                )
                yield trail
            except:
                continue