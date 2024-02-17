from typing import Optional

from fastapi import Header, HTTPException

from db.database import get_session
from db.models import User, AccessToken


async def verify_access_key(access_key: str = Header(...)) -> User:
    if access_key is None:
        raise HTTPException(status_code=400, detail="Access-Key is required")

    qs = get_session().query(AccessToken).filter(AccessToken.token == access_key)
    if qs.count() == 0:
        raise HTTPException(
            status_code=400, detail=f"invalid Access-Key '{access_key}'"
        )

    user_id = qs.first().user_id
    return get_session().query(User).filter(User.id == user_id).first()


async def optional_user(access_key: Optional[str] = Header(default=None)):
    if access_key is None:
        return None

    qs = get_session().query(AccessToken).filter(AccessToken.token == access_key)
    if qs.count() == 0:
        return None

    user_id = qs.first().user_id
    return get_session().query(User).filter(User.id == user_id).first()
