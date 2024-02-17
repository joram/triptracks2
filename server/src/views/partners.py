from fastapi import APIRouter, Depends, HTTPException

from utils.auth import verify_access_key
from db.database import get_session
from db.models import User, Partner, prefixed_id

router = APIRouter()


@router.get("/api/v0/partners")
async def partners(user: User = Depends(verify_access_key)) -> list[Partner]:
    session = get_session()
    qs = session.query(Partner).filter(Partner.user_id == user.id)
    response = []
    for partner in qs:
        response.append(
            Partner(
                email=partner.email,
                id=partner.id,
                user_id=partner.user_id,
            )
        )
    return response


@router.post("/api/v0/partner")
async def add_partner(email: str, user: User = Depends(verify_access_key)) -> Partner:
    session = get_session()
    partner = Partner(id=prefixed_id("partner"), user_id=user.id, email=email)
    session.add(partner)
    session.commit()
    return partner


@router.delete("/api/v0/partner/{partner_id}")
async def remove_partner(partner_id: str, user: User = Depends(verify_access_key)):
    session = get_session()
    qs = session.query(Partner).filter(Partner.id == partner_id)
    if qs.count() == 0:
        raise HTTPException(status_code=404, detail="partner not found")
    partner = qs.first()
    session.delete(partner)
    session.commit()
    return partner
