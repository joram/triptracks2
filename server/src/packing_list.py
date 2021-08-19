from typing import Optional, List, Dict

from fastapi import Depends
from pydantic import BaseModel

from . import verify_access_key
from .app import app


class Item(BaseModel):
    name: str
    description: Optional[str] = None
    weight_grams: int
    image_url: str


class PackingList(BaseModel):
    items: List[Item]


@app.get("/api/v0/packing_lists")
async def list_packing_lists(email: str = Depends(verify_access_key)) -> Dict[str, PackingList]:
    print(f"{email} is authed")
    items = {"regular": PackingList(items=[Item(
        name="regular",
        description="my regular packing list",
        weight_grams=25,
        image_url="https://placecage.com/256x256",
    )])}
    return items


@app.post("/api/v0/packing_lists")
async def create_items(items: Dict[str, PackingList]) -> None:
    return None
