"""Load the generated trail files (scripts/build.py output) into PostGIS.

Usage (from server/src):
    python -m db.load_trails ../../web/public

Reads <dir>/trail_details/<geohash>.json and <dir>/trails/<geohash>.geojson,
upserting one row per trail. Safe to re-run.
"""
import json
import os
import sys

from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert

from db.database import engine, run_migrations
from db.models import Trail

BATCH_SIZE = 500


def _clean_lines(geometry: dict) -> list:
    """Drop repeated points and degenerate (<2 point) lines, which PostGIS treats as invalid."""
    lines = []
    for line in geometry["coordinates"]:
        points = [p for i, p in enumerate(line) if i == 0 or p != line[i - 1]]
        if len(points) >= 2:
            lines.append(points)
    return lines


def _rows(public_dir: str):
    details_dir = os.path.join(public_dir, "trail_details")
    geojson_dir = os.path.join(public_dir, "trails")
    for filename in sorted(os.listdir(details_dir)):
        geohash = filename.removesuffix(".json")
        with open(os.path.join(details_dir, filename)) as f:
            details = json.load(f)

        geometry = None
        geojson_path = os.path.join(geojson_dir, f"{geohash}.geojson")
        if os.path.exists(geojson_path):
            with open(geojson_path) as f:
                collection = json.load(f)
            if collection and collection.get("features"):
                lines = _clean_lines(collection["features"][0]["geometry"])
                if lines:
                    geometry = {"type": "MultiLineString", "coordinates": lines}
        if geometry is None:
            # Keep the trail's details and center point; it just has no line to draw.
            print(f"  {geohash}: no usable geometry")

        yield {
            "id": details["center_geohash"],
            "trail_id": details.get("trail_id"),
            "title": details.get("title"),
            "description": details.get("description"),
            "directions": details.get("directions"),
            "source_url": details.get("source_url"),
            "photos": details.get("photos", []),
            "stats": details.get("stats", {}),
            "geohash": details.get("geohash"),
            "nearest_peak_geohash": details.get("nearest_peak_geohash"),
            "center": func.ST_SetSRID(
                func.ST_MakePoint(details["center_lng"], details["center_lat"]), 4326
            ),
            "geom": func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geometry)), 4326)
            if geometry
            else None,
        }


def _upsert(conn, batch):
    stmt = insert(Trail.__table__).values(batch)
    updates = {c: stmt.excluded[c] for c in batch[0] if c != "id"}
    conn.execute(stmt.on_conflict_do_update(index_elements=["id"], set_=updates))


def main(public_dir: str):
    run_migrations()
    total = 0
    batch = []
    with engine.begin() as conn:
        for row in _rows(public_dir):
            batch.append(row)
            if len(batch) >= BATCH_SIZE:
                _upsert(conn, batch)
                total += len(batch)
                print(f"loaded {total}")
                batch = []
        if batch:
            _upsert(conn, batch)
            total += len(batch)
    print(f"done: {total} trails")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
