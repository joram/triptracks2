"""Build a DPoP proof (RFC 9449) for auth-broker ticket exchange."""

from __future__ import annotations

import base64
import time
import uuid

import jwt
from cryptography.hazmat.primitives.asymmetric import ec


def _coord_b64url(value: int) -> str:
    length = (value.bit_length() + 7) // 8 or 1
    return base64.urlsafe_b64encode(value.to_bytes(length, "big")).decode().rstrip("=")


def build_dpop_proof(broker_url: str) -> str:
    """Return a signed DPoP JWT for POST {broker_url}/auth/session/exchange."""
    private_key = ec.generate_private_key(ec.SECP256R1())
    public_numbers = private_key.public_key().public_numbers()
    htu = broker_url.rstrip("/") + "/auth/session/exchange"
    headers = {
        "typ": "dpop+jwt",
        "alg": "ES256",
        "jwk": {
            "kty": "EC",
            "crv": "P-256",
            "x": _coord_b64url(public_numbers.x),
            "y": _coord_b64url(public_numbers.y),
        },
    }
    payload = {
        "htm": "POST",
        "htu": htu,
        "jti": str(uuid.uuid4()),
        "iat": int(time.time()),
    }
    return jwt.encode(payload, private_key, algorithm="ES256", headers=headers)
