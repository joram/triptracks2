from typing import Optional, List, Dict

from fastapi import Depends, HTTPException
from pydantic import BaseModel

from . import verify_access_key
from .app import app
from .db.database import get_session
from .db.models import PackingList, User


class PackingListRequest(BaseModel):
    name: str
    contents: List[dict]


class PackingListResponse(PackingListRequest):
    weight: int
    id: str


@app.get("/api/v0/packing_lists")
async def get_packing_lists(user: User = Depends(verify_access_key)) -> list[PackingListResponse]:
    print(f"{user.email} is authed")
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.user_id == user.id)
    print(vars(session))
    print(qs[0].contents)

    packing_lists = []
    for packing_list in qs:
        weight = sum([item["weight"] for item in packing_list.contents])
        packing_lists.append(PackingListResponse(
            name=packing_list.name,
            contents=list(packing_list.contents),
            weight=weight,
            id=packing_list.id,
        ))
    return packing_lists


@app.get("/api/v0/packing_list/{packing_list_id}")
async def get_packing_list(packing_list_id: str, user: User = Depends(verify_access_key)) -> PackingListResponse:
    print(f"{user.email} is authed")
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.user_id == user.id, PackingList.id == packing_list_id)
    if qs.count() == 0:
        print(user.email, user.id, packing_list_id)
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    return PackingListResponse(
        name=packing_list.name,
        contents=list(packing_list.contents),
        weight=sum([item["weight"] for item in packing_list.contents]),
        id=packing_list.id,

    )


@app.post("/api/v0/packing_list/{packing_list_id}")
async def update_packing_list(packing_list_id: str, request: PackingListRequest, user: User = Depends(verify_access_key)) -> PackingList:
    print(f"{user.email} is authed")
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.user_id == user.id, PackingList.id == packing_list_id)
    if qs.count() == 0:
        print(user.email, user.id, packing_list_id)
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    packing_list.name = request.name
    packing_list.contents = request.contents

    session.add(packing_list)
    session.commit()

    return packing_list


@app.delete("/api/v0/packing_list/{packing_list_id}")
async def remove_packing_list(packing_list_id: str, user: User = Depends(verify_access_key)):
    print(f"{user.email} is authed")
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.user_id == user.id, PackingList.id == packing_list_id)
    if qs.count() == 0:
        print(user.email, user.id, packing_list_id)
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    session.delete(packing_list)
    session.commit()


@app.post("/api/v0/packing_list")
async def create_packing_list(user: User = Depends(verify_access_key)) -> str:
    print(f"{user.email} is authed, creating new packing list")
    packing_list = PackingList.new(name="new packing list", user=user, contents={})
    session = get_session()
    session.add(packing_list)
    session.commit()
    print("created", packing_list)
    return packing_list.id
