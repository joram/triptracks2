import os

GOOGLE_CLIENT_ID = "965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"

def _first_env(*keys: str) -> str:
    for key in keys:
        value = os.environ.get(key, "").strip().rstrip("/")
        if value:
            return value
    return ""


# VeilStream auth router (preview OAuth). Unset in production for direct Google login.
VEILSTREAM_AUTH_ROUTER_URL = _first_env(
    "VEILSTREAM_AUTH_ROUTER_URL",
    "REACT_APP_VEILSTREAM_AUTH_ROUTER_URL",
    "VEILSTREAM_AUTH_BROKER_URL",
    "REACT_APP_VEILSTREAM_AUTH_BROKER_URL",
    "REACT_APP_OAUTH_ISSUER",
)
VEILSTREAM_JWT_AUDIENCE = os.environ.get(
    "VEILSTREAM_JWT_AUDIENCE", "veilstream-preview-auth"
)

dir_path = os.path.dirname(os.path.realpath(__file__))
CONFIG_DIR = os.environ.get("TT_CONFIG_DIR", os.path.join(dir_path, "../config"))
