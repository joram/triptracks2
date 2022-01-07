import uuid

from fastapi import Header, HTTPException, Depends
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel

from .app import app
from .settings import GOOGLE_CLIENT_ID


class AccessKeyRequest(BaseModel):
    token: str

ACCESS_KEYS = []
ACCESS_KEYS_BY_EMAIL = {}
EMAIL_BY_ACCESS_KEYS = {}
USERINFO_BY_EMAIL = {}


@app.post("/api/v0/access_key")
async def create_access_key(request: AccessKeyRequest):
    global ACCESS_KEYS
    global ACCESS_KEYS_BY_EMAIL
    global EMAIL_BY_ACCESS_KEYS
    global USERINFO_BY_EMAIL
    try:
        idinfo = id_token.verify_oauth2_token(request.token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo["email"]

        if email in ACCESS_KEYS_BY_EMAIL:
            return ACCESS_KEYS_BY_EMAIL.get(email)

        access_key = str(uuid.uuid4())
        ACCESS_KEYS.append(access_key)
        ACCESS_KEYS_BY_EMAIL[email] = access_key
        EMAIL_BY_ACCESS_KEYS[access_key] = email
        USERINFO_BY_EMAIL[email] = idinfo
        return access_key

    except ValueError:
        return None


async def verify_access_key(access_key: str = Header(...)):
    if access_key not in ACCESS_KEYS:
        raise HTTPException(status_code=400, detail="Access-Key header invalid")
    return EMAIL_BY_ACCESS_KEYS.get(access_key)


@app.get("/api/v0/userinfo")
async def userinfo(email: str = Depends(verify_access_key)):
    try:
        info = USERINFO_BY_EMAIL[email]
        return info
    except ValueError:
        return None