from typing import Optional, List, Dict

from fastapi import Depends, HTTPException
from pydantic import BaseModel

from . import verify_access_key
from .app import app
from .db.database import get_session
from .db.models import TripPlan, User


@app.get("/api/v0/trip_plans")
async def get_trip_plans(user: User = Depends(verify_access_key)) -> list[TripPlan]:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.user_id == user.id)
    return [tp for tp in qs]


@app.get("/api/v0/trip_plan/{trip_plan_id}")
async def get_trip_plan(trip_plan_id: str, user: User = Depends(verify_access_key)) -> TripPlan:
    session = get_session()
    qs = session.query(TripPlan).filter(
        TripPlan.user_id == user.id,
        TripPlan.id == trip_plan_id,
    )
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    trip_plan = qs.first()
    return TripPlan(
        name=trip_plan.name,
        id=trip_plan.id,
    )


class TripPlanRequest(BaseModel):
    name: str


@app.post("/api/v0/trip_plan/{trip_plan_id}")
async def update_trip_plan(trip_plan_id: str, request: TripPlanRequest, user: User = Depends(verify_access_key)) -> TripPlan:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.user_id == user.id, TripPlan.id == trip_plan_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    trip_plan = qs.first()
    trip_plan.name = request.name

    session.add(trip_plan)
    session.commit()

    return trip_plan


@app.delete("/api/v0/trip_plan/{trip_plan_id}")
async def remove_trip_plan(trip_plan_id: str, user: User = Depends(verify_access_key)):
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.user_id == user.id, TripPlan.id == trip_plan_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    trip_plan = qs.first()
    session.delete(trip_plan)
    session.commit()


@app.post("/api/v0/trip_plan")
async def create_trip_plan(user: User = Depends(verify_access_key)) -> str:
    trip_plan = TripPlan.new(name="new trip plan", user=user)
    session = get_session()
    session.add(trip_plan)
    session.commit()
    print(trip_plan)
    return trip_plan.id
