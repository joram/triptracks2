from fastapi import Header, HTTPException, Depends
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel
from sqlalchemy.testing import db

from .app import app
from .db.database import get_session
from .db.models import User, AccessToken
from .settings import GOOGLE_CLIENT_ID


class AccessKeyRequest(BaseModel):
    token: str


@app.post("/api/v0/access_key")
async def create_access_key(request: AccessKeyRequest):

    userinfo = id_token.verify_oauth2_token(request.token, requests.Request(), GOOGLE_CLIENT_ID)
    email = userinfo["email"]

    # upsert user_id
    session = get_session()
    qs = session.query(User).filter(User.email == email)
    if qs.count() >= 1:
        user = qs.first()
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
    return access_token.token


async def verify_access_key(access_key: str = Header(...)) -> User:
    qs = get_session().query(AccessToken).filter(AccessToken.token == access_key)
    print(f"access_key {access_key} exist?")
    if qs.count() == 0:
        print("nope")
        raise HTTPException(status_code=400, detail="Access-Key header invalid")
    user_id = qs.first().user_id
    return get_session().query(User).filter(User.id==user_id).first()

@app.get("/api/v0/userinfo")
async def userinfo(user: User = Depends(verify_access_key)):
    print(user)
    return user.google_userinfo