import datetime
from typing import Optional, List, Dict, Union

import pprint
import json
from fastapi import Depends, HTTPException
from pydantic import BaseModel
import geohash2

from . import verify_access_key
from .app import app
from .db.database import get_session
from .db.models import TripPlan, User


@app.get("/api/v0/trip_plans")
async def get_trip_plans(user: User = Depends(verify_access_key)) -> list[TripPlan]:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.user_id == user.id)
    return [tp for tp in qs]


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

    print("trip_plan.itinerary", trip_plan.itinerary)
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
    itinerary: Optional[Dict]


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


def flesh_out_itinerary(trails, itinerary):
    print(itinerary)
    lat, lng = 0, 0

    trails.reverse()
    for geohash_code in trails:
        try:
            int(geohash_code)
            continue
        except:
            pass

        try:
            lat, lng = geohash2.decode(geohash_code)
            lat = float(lat)
            lng = float(lng)
            print("trail, lat, lng", geohash_code, lat, lng, type(lat), type(lng))
            break
        except Exception as e:
            print(e)
            continue
    from suntimes import SunTimes

    place = SunTimes(lng, lat)

    newItinerary = []

    for i, day_timeline in enumerate(itinerary):
        print("day_timeline", day_timeline)
        date = day_timeline["date"]
        date = datetime.datetime.strptime(date, "%Y-%m-%dT%H:%M:%S.%fZ").date()
        sunrise_dt = place.riselocal(date)
        print(date, "sunrise_dt", sunrise_dt)
        sunrise_event = {
            "description": "sunrise",
            "startTime": sunrise_dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            "durationMinutes": 0,
            "inferred": {
                "timeString": sunrise_dt.strftime("%H:%M"),
            },
        }
        sunset_dt = place.setlocal(date)
        print(date, "sunset_dt", sunset_dt)
        sunset_event = {
            "description": "sunset",
            "startTime": sunset_dt.strftime("%Y-%m-%dT%H:%M:%S.%fZ"),
            "durationMinutes": 0,
            "inferred": {
                "timeString": sunset_dt.strftime("%H:%M"),
            },
        }

        added_sunrise = False
        added_sunset = False
        newTimeline = []
        for event in day_timeline.get("timeline", []):
            if event["description"] == "sunrise":
                newTimeline.append(sunrise_event)
                added_sunrise = True
            elif event["description"] == "sunset":
                newTimeline.append(sunset_event)
                added_sunset = True
            else:
                newTimeline.append(event)

        if not added_sunrise:
            newTimeline.append(sunrise_event)

        if not added_sunset:
            newTimeline.append(sunset_event)

        newItinerary.append(
            {
                "date": day_timeline["date"],
                "timeline": newTimeline,
            }
        )
    return newItinerary


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
    print("request.itinerary", request.itinerary)
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
