import json
from typing import Optional, List, Union, Any

from fastapi import Depends, HTTPException
from pydantic import BaseModel

from . import verify_access_key
from .app import app
from .db.database import get_session
from .db.models import TripPlan, User
from .utils.trip_plan.sunrise_and_sunset import flesh_out_itinerary

DT_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
D_FORMAT = "%Y-%m-%d"


@app.get("/api/v0/trip_plans")
async def get_trip_plans(user: User = Depends(verify_access_key)) -> list[TripPlan]:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.user_id == user.id)
    response = []
    for tp in qs:
        response.append(
            TripPlan(
                name=tp.name,
                id=tp.id,
                dates=string_to_date(tp.dates) if tp.dates else None,
                people=tp.people,
                trails=tp.trails,
                itinerary=tp.itinerary,
            )
        )
    return response


def string_to_date(s):
    data = json.loads(s)
    return TripPlanRequest.TripPlanDate(
        type=data["type"],
        dates=data["dates"],
    )


@app.get("/api/v0/trip_plan/{trip_plan_id}")
async def get_trip_plan(
    trip_plan_id: str, user: User = Depends(verify_access_key)
) -> TripPlan:
    session = get_session()
    qs = session.query(TripPlan).filter(
        TripPlan.user_id == user.id,
        TripPlan.id == trip_plan_id,
    )
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    trip_plan = qs.first()
    trip_plan.people = flesh_out_people(trip_plan.people)
    trip_plan.itinerary = flesh_out_itinerary(trip_plan.trails, trip_plan.itinerary)

    response = TripPlan(
        name=trip_plan.name,
        id=trip_plan.id,
        dates=string_to_date(trip_plan.dates) if trip_plan.dates else None,
        people=trip_plan.people,
        trails=trip_plan.trails,
        itinerary=trip_plan.itinerary,
    )
    return response


class TripPlanRequest(BaseModel):

    class TripPlanDate(BaseModel):
        type: str
        dates: Union[str, List[str], None]

    name: str
    dates: Optional[TripPlanDate]
    people: List[Union[str, dict]]
    trails: List[str]
    itinerary: List[Any]


def flesh_out_people(people):
    fleshed_out = []
    for p in people:
        if isinstance(p, str):
            session = get_session()
            qs = session.query(User).filter(User.email == p)
            if qs.count() > 0:
                user = qs.first()
                fleshed_out.append(
                    {
                        "email": user.email,
                        "google_info": user.google_userinfo,
                        "id": user.id,
                    }
                )
                continue

        fleshed_out.append(p)
    return fleshed_out


@app.patch("/api/v0/trip_plan/{trip_plan_id}")
async def update_trip_plan(
    trip_plan_id: str, request: TripPlanRequest, user: User = Depends(verify_access_key)
) -> TripPlan:
    session = get_session()
    qs = session.query(TripPlan).filter(
        TripPlan.user_id == user.id, TripPlan.id == trip_plan_id
    )
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    trip_plan = qs.first()

    # update values
    trip_plan.name = request.name
    trip_plan.dates = request.dates.json() if request.dates else None
    trip_plan.people = flesh_out_people(request.people)
    trip_plan.trails = request.trails
    trip_plan.itinerary = flesh_out_itinerary(request.trails, request.itinerary)

    session.add(trip_plan)
    session.commit()

    response = TripPlan(
        name=trip_plan.name,
        id=trip_plan.id,
        dates=string_to_date(trip_plan.dates) if trip_plan.dates else None,
        people=trip_plan.people,
        trails=trip_plan.trails,
        itinerary=trip_plan.itinerary,
    )

    return response


@app.delete("/api/v0/trip_plan/{trip_plan_id}")
async def remove_trip_plan(trip_plan_id: str, user: User = Depends(verify_access_key)):
    session = get_session()
    qs = session.query(TripPlan).filter(
        TripPlan.user_id == user.id, TripPlan.id == trip_plan_id
    )
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
    return trip_plan.id
