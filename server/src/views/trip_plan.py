import json
from typing import Optional, List, Union, Any, Dict

from fastapi import Depends, HTTPException, APIRouter
from pydantic import BaseModel

from utils.auth import optional_user, verify_access_key
from db.database import get_session
from db.models import TripPlan, User
from utils.trip_plan.sunrise_and_sunset import flesh_out_itinerary
from utils.users import flesh_out_people

DT_FORMAT = "%Y-%m-%dT%H:%M:%S.%fZ"
D_FORMAT = "%Y-%m-%d"

router = APIRouter()


@router.get("/api/v0/trip_plans", response_model=None)
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
    # Return a plain dict: GetTripPlanResponse.dates is typed Dict, and
    # pydantic v2 will not coerce a BaseModel into a Dict field.
    data = json.loads(s)
    return {"type": data["type"], "dates": data["dates"]}


class GetTripPlanResponse(BaseModel):
    id: str
    user_id: str
    name: str
    packing_lists: Optional[Union[List, Dict]] = None
    people: Union[List, Dict]
    trails: Union[List, Dict]
    pins: List = []
    dates: Optional[Dict] = None
    itinerary: List = []
    editable: bool


@router.get("/api/v0/trip_plan/{trip_plan_id}")
async def get_trip_plan(
    trip_plan_id: str, user: User = Depends(optional_user)
) -> GetTripPlanResponse:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.id == trip_plan_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="trip plan not found")
    trip_plan = qs.first()
    trip_plan.people = flesh_out_people(trip_plan.people)

    editable = True
    try:
        validate_user_access(user, trip_plan)
    except HTTPException:
        editable = False

    trip_plan.itinerary = flesh_out_itinerary(trip_plan.trails, trip_plan.itinerary)

    response = GetTripPlanResponse(
        user_id=trip_plan.user_id,
        name=trip_plan.name,
        id=trip_plan.id,
        dates=string_to_date(trip_plan.dates) if trip_plan.dates else None,
        people=trip_plan.people or [],
        trails=trip_plan.trails or [],
        pins=trip_plan.pins or [],
        itinerary=trip_plan.itinerary or [],
        packing_lists=trip_plan.packing_lists or [],
        editable=editable,
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
    pins: List[Any] = []
    packing_lists: List[Any] = []
    itinerary: List[Any]


def validate_user_access(user: User, trip_plan: TripPlan):
    if user is None:
        raise HTTPException(status_code=403, detail="access denied")
    if trip_plan.user_id == user.id:
        return True
    for user in trip_plan.people:
        if user["id"] == user.id:
            return True
    raise HTTPException(status_code=403, detail="access denied")


@router.patch("/api/v0/trip_plan/{trip_plan_id}")
async def update_trip_plan(
    trip_plan_id: str, request: TripPlanRequest, user: User = Depends(verify_access_key)
) -> GetTripPlanResponse:
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.id == trip_plan_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="trip plan not found")
    trip_plan = qs.first()
    validate_user_access(user, trip_plan)

    # update values
    trip_plan.name = request.name
    trip_plan.dates = request.dates.json() if request.dates else None
    trip_plan.people = flesh_out_people(request.people)
    trip_plan.trails = request.trails
    trip_plan.pins = request.pins
    trip_plan.packing_lists = request.packing_lists
    trip_plan.itinerary = flesh_out_itinerary(request.trails, request.itinerary)

    session.add(trip_plan)
    session.commit()

    return GetTripPlanResponse(
        user_id=trip_plan.user_id,
        name=trip_plan.name,
        id=trip_plan.id,
        dates=string_to_date(trip_plan.dates) if trip_plan.dates else None,
        people=trip_plan.people or [],
        trails=trip_plan.trails or [],
        pins=trip_plan.pins or [],
        itinerary=trip_plan.itinerary or [],
        packing_lists=trip_plan.packing_lists or [],
        editable=True,
    )


@router.delete("/api/v0/trip_plan/{trip_plan_id}")
async def remove_trip_plan(trip_plan_id: str, user: User = Depends(verify_access_key)):
    session = get_session()
    qs = session.query(TripPlan).filter(TripPlan.id == trip_plan_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="trip plan not found")
    trip_plan = qs.first()
    validate_user_access(user, trip_plan)

    session.delete(trip_plan)
    session.commit()


@router.post("/api/v0/trip_plan")
async def create_trip_plan(user: User = Depends(verify_access_key)) -> str:
    trip_plan = TripPlan.new(name="new trip plan", user=user)
    session = get_session()
    session.add(trip_plan)
    session.commit()
    return trip_plan.id
