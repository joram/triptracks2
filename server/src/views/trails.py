import json

from fastapi import APIRouter, HTTPException, Query
from sqlalchemy import func

from db.database import get_session
from db.models import Trail

router = APIRouter()

MAX_TRAILS = 500


def _parse_bbox(bbox: str) -> list[float]:
    try:
        values = [float(v) for v in bbox.split(",")]
    except ValueError:
        values = []
    if len(values) != 4:
        raise HTTPException(status_code=400, detail="bbox must be minLng,minLat,maxLng,maxLat")
    return values


@router.get("/api/v0/trails")
async def trails_in_bbox(
    bbox: str = Query(..., description="minLng,minLat,maxLng,maxLat"),
    limit: int = Query(200, ge=1, le=MAX_TRAILS),
    simplify: float = Query(0.0, ge=0, description="tolerance in degrees"),
) -> dict:
    min_lng, min_lat, max_lng, max_lat = _parse_bbox(bbox)
    envelope = func.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat, 4326)
    geom = func.ST_SimplifyPreserveTopology(Trail.geom, simplify) if simplify else Trail.geom

    with get_session() as session:
        rows = (
            session.query(Trail.id, Trail.title, func.ST_AsGeoJSON(geom))
            .filter(func.ST_Intersects(Trail.geom, envelope))
            .limit(limit)
            .all()
        )
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "id": trail_id,
                "properties": {"center_geohash": trail_id, "title": title},
                "geometry": json.loads(geometry),
            }
            for trail_id, title, geometry in rows
        ],
    }


@router.get("/api/v0/trails/search")
async def search_trails(q: str = Query(..., min_length=2), limit: int = Query(20, ge=1, le=100)) -> list[dict]:
    with get_session() as session:
        trails = (
            session.query(Trail)
            .filter(Trail.title.ilike(f"%{q}%"))
            .order_by(Trail.title)
            .limit(limit)
            .all()
        )
    return [
        {
            "title": t.title,
            "image": t.photos[0] if t.photos else None,
            "url": f"/trail/{t.id}",
        }
        for t in trails
    ]


@router.get("/api/v0/trail/{trail_id}")
async def trail_details(trail_id: str) -> dict:
    with get_session() as session:
        row = (
            session.query(Trail, func.ST_X(Trail.center), func.ST_Y(Trail.center))
            .filter(Trail.id == trail_id)
            .first()
        )
    if row is None:
        raise HTTPException(status_code=404, detail="trail not found")
    trail, lng, lat = row
    return {**trail.details(), "center_lat": lat, "center_lng": lng}


@router.get("/api/v0/trail/{trail_id}/geojson")
async def trail_geojson(trail_id: str) -> dict:
    with get_session() as session:
        row = (
            session.query(Trail.geohash, func.ST_AsGeoJSON(Trail.geom))
            .filter(Trail.id == trail_id)
            .first()
        )
    if row is None or row[1] is None:
        raise HTTPException(status_code=404, detail="trail not found")
    geohash, geometry = row
    return {
        "type": "FeatureCollection",
        "id": geohash,
        "features": [{"type": "Feature", "properties": {}, "geometry": json.loads(geometry)}],
    }
