from typing import Optional, List, Dict

from fastapi import Depends
from pydantic import BaseModel

from . import verify_access_key
from .app import app


class Item(BaseModel):
    name: str
    weight: int
    image_url: str


class PackingList(BaseModel):
    name: str
    items: List[Item]


PACKING_LISTS = {}


@app.get("/api/v0/packing_lists")
async def get_packing_lists(email: str = Depends(verify_access_key)) -> Dict[str, PackingList]:
    print(f"{email} is authed")
    if email not in PACKING_LISTS:
        PACKING_LISTS[email] = {}
    return PACKING_LISTS[email]


@app.post("/api/v0/packing_list")
async def set_packing_list(packing_list: PackingList, email: str = Depends(verify_access_key)) -> Dict[str, PackingList]:
    print(f"{email} is authed")

    if email not in PACKING_LISTS:
        PACKING_LISTS[email] = {}
    if packing_list.name not in PACKING_LISTS[email]:
        PACKING_LISTS[email][packing_list.name] = []

    PACKING_LISTS[email][packing_list.name] = packing_list.items

    return PACKING_LISTS[email]
