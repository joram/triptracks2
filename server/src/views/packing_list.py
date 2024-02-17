from typing import List

from fastapi import Depends, HTTPException, APIRouter
from pydantic import BaseModel

from db.database import get_session
from db.models import PackingList, User
from utils.auth import verify_access_key

router = APIRouter()


class PackingListRequest(BaseModel):
    name: str
    contents: List[dict]


class PackingListResponse(PackingListRequest):
    id: str
    ownerId: str


@router.get("/api/v0/packing_lists")
async def get_packing_lists(
    user: User = Depends(verify_access_key),
) -> list[PackingListResponse]:
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.user_id == user.id)
    packing_lists = []
    for packing_list in qs:
        packing_lists.append(
            PackingListResponse(
                name=packing_list.name,
                contents=list(packing_list.contents),
                id=packing_list.id,
                ownerId=packing_list.user_id,
            )
        )
    return packing_lists


@router.get("/api/v0/packing_list/{packing_list_id}")
async def get_packing_list(packing_list_id: str) -> PackingListResponse:
    session = get_session()
    qs = session.query(PackingList).filter(PackingList.id == packing_list_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    return PackingListResponse(
        name=packing_list.name,
        contents=list(packing_list.contents),
        id=packing_list.id,
        ownerId=packing_list.user_id,
    )


@router.post("/api/v0/packing_list/{packing_list_id}")
async def update_packing_list(
    packing_list_id: str,
    request: PackingListRequest,
    user: User = Depends(verify_access_key),
) -> PackingList:
    session = get_session()
    qs = session.query(PackingList).filter(
        PackingList.user_id == user.id, PackingList.id == packing_list_id
    )
    if qs.count() == 0:
        print(user.email, user.id, packing_list_id)
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    packing_list.name = request.name
    packing_list.contents = request.contents

    session.add(packing_list)
    session.commit()

    return packing_list


@router.delete("/api/v0/packing_list/{packing_list_id}")
async def remove_packing_list(
    packing_list_id: str, user: User = Depends(verify_access_key)
):
    session = get_session()
    qs = session.query(PackingList).filter(
        PackingList.user_id == user.id, PackingList.id == packing_list_id
    )
    if qs.count() == 0:
        print(user.email, user.id, packing_list_id)
        raise HTTPException(status_code=404, detail="packing list not found")
    packing_list = qs.first()
    session.delete(packing_list)
    session.commit()


@router.post("/api/v0/packing_list")
async def create_packing_list(user: User = Depends(verify_access_key)) -> str:
    packing_list = PackingList.new(name="new packing list", user=user, contents={})
    session = get_session()
    session.add(packing_list)
    session.commit()
    print("created", packing_list)
    return packing_list.id
