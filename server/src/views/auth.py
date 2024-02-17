from fastapi import APIRouter, requests, Depends
from google.oauth2 import id_token
from pydantic import BaseModel

from db.database import get_session
from db.models import User, prefixed_id, AccessToken
from settings import GOOGLE_CLIENT_ID
from utils.auth import verify_access_key

router = APIRouter()


class AccessKeyRequest(BaseModel):
    token: str


@router.post("/api/v0/access_key")
async def create_access_key(request: AccessKeyRequest):
    userinfo = id_token.verify_oauth2_token(
        request.token, requests.Request(), GOOGLE_CLIENT_ID
    )
    email = userinfo["email"]
    print(userinfo)

    # upsert user_id
    session = get_session()
    qs = session.query(User).filter(User.email == email)
    if qs.count() >= 1:
        user = qs.first()
        if user.id is None:
            user.id = prefixed_id("user")
        user.google_userinfo = userinfo
        session.add(user)
    else:
        user = User.new(email=email, google_userinfo=userinfo)
        session.add(user)

    # upsert access key
    qs = session.query(AccessToken).filter(AccessToken.user_id == user.id)
    if qs.count() >= 1:
        access_token = qs.first()
    else:
        access_token = AccessToken.new(user=user)
        session.add(access_token)

    session.commit()
    return {
        "token": access_token.token,
        "user_id": user.id,
    }


@router.get("/api/v0/userinfo")
async def userinfo(user: User = Depends(verify_access_key)):
    return user
