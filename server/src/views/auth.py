from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token
from pydantic import BaseModel
import httpx
from authlib.jose import jwt, JsonWebKey
from authlib.jose.errors import JoseError

from db.database import get_session
from db.models import User, prefixed_id, AccessToken
from settings import GOOGLE_CLIENT_ID, VEILSTREAM_AUTH_BROKER_URL, VEILSTREAM_JWT_AUDIENCE
from utils.auth import verify_access_key
from utils.broker_dpop import build_dpop_proof

router = APIRouter()


class AccessKeyRequest(BaseModel):
    token: str


class BrokerTicketRequest(BaseModel):
    ticket: str


def _issue_access_key(email: str, userinfo: dict) -> dict:
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


@router.post("/api/v0/access_key")
async def create_access_key(request: AccessKeyRequest):
    userinfo = id_token.verify_oauth2_token(
        request.token, requests.Request(), GOOGLE_CLIENT_ID
    )
    email = userinfo["email"]
    result = _issue_access_key(email, userinfo)
    return result


@router.post("/api/v0/access_key/broker")
async def create_access_key_from_broker(request: BrokerTicketRequest):
    if not VEILSTREAM_AUTH_BROKER_URL:
        raise HTTPException(status_code=400, detail="auth broker is not configured")

    try:
        dpop_proof = build_dpop_proof(VEILSTREAM_AUTH_BROKER_URL)
        async with httpx.AsyncClient(timeout=15.0) as client:
            exchange = await client.post(
                f"{VEILSTREAM_AUTH_BROKER_URL}/auth/session/exchange",
                json={"ticket": request.ticket},
                headers={"DPoP": dpop_proof},
            )
            if exchange.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"broker ticket exchange failed ({exchange.status_code})",
                )
            payload = exchange.json()

            jwks_resp = await client.get(
                f"{VEILSTREAM_AUTH_BROKER_URL}/.well-known/jwks.json"
            )
            jwks_resp.raise_for_status()
            jwks = jwks_resp.json()
    except HTTPException:
        raise
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"auth broker unreachable: {exc}") from exc

    identity_token = payload.get("identity_token")
    if not identity_token:
        raise HTTPException(status_code=400, detail="broker response missing identity_token")

    try:
        key_set = JsonWebKey.import_key_set(jwks)
        claims = jwt.decode(
            identity_token,
            key_set,
            claims_options={
                "iss": {"essential": True, "value": VEILSTREAM_AUTH_BROKER_URL},
                "aud": {"essential": True, "value": VEILSTREAM_JWT_AUDIENCE},
            },
        )
        claims.validate()
    except JoseError as exc:
        raise HTTPException(status_code=400, detail=f"invalid identity token: {exc}") from exc

    user = payload.get("user") or {}
    email = user.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="broker response missing user email")

    userinfo = {
        "email": email,
        "email_verified": user.get("email_verified", True),
        "sub": user.get("provider_subject"),
        "name": email.split("@", 1)[0],
        "auth_broker": True,
        "provider": payload.get("provider"),
        "project_id": payload.get("project_id"),
        "environment_id": payload.get("environment_id"),
    }

    result = _issue_access_key(email, userinfo)
    result["email"] = email
    result["name"] = userinfo["name"]
    result["provider_subject"] = userinfo.get("sub")
    return result


@router.get("/api/v0/userinfo")
async def userinfo(user: User = Depends(verify_access_key)):
    return user
