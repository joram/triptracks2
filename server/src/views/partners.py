from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from utils.auth import verify_access_key
from db.database import get_session
from db.models import User, Partner, prefixed_id
from utils.users import flesh_out_people

router = APIRouter()


@router.get("/api/v0/partners")
async def partners(user: User = Depends(verify_access_key)) -> list[Partner]:
    session = get_session()
    qs = session.query(Partner).filter(Partner.user_id == user.id)

    def get_partner_id(email):
        for partner in qs:
            if partner.email == email:
                return partner.id

    emails = [partner.email for partner in qs]
    response = flesh_out_people(emails)
    for partner in response:
        partner["partner_id"] = get_partner_id(partner["email"])

    return response


class AddPartnerRequest(BaseModel):
    email: str


@router.post("/api/v0/partner")
async def add_partner(
    request: AddPartnerRequest, user: User = Depends(verify_access_key)
) -> Partner:
    session = get_session()
    partner = Partner(id=prefixed_id("partner"), user_id=user.id, email=request.email)
    session.add(partner)
    session.commit()
    return partner


@router.delete("/api/v0/partner/{partner_id}")
async def remove_partner(partner_id: str, user: User = Depends(verify_access_key)):
    session = get_session()
    print(partner_id, user.id)
    qs = session.query(Partner).filter(
        Partner.id == partner_id,
        Partner.user_id == user.id,
    )
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="partner not found")
    partner = qs.first()
    session.delete(partner)
    session.commit()
    return partner
