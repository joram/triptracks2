import os

# Google OAuth client IDs whose sign-in tokens we accept. The web app signs in with
# the triptracks client (web/src/App.jsx); the older client is kept so existing
# integrations keep working. Override with a comma-separated GOOGLE_CLIENT_IDS.
GOOGLE_CLIENT_IDS = [
    client_id.strip()
    for client_id in os.environ.get(
        "GOOGLE_CLIENT_IDS",
        "747834684984-1oc9jk95e5n2u2dl4p8qrokc307j06qn.apps.googleusercontent.com,"
        "965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com",
    ).split(",")
    if client_id.strip()
]


def _first_env(*keys: str) -> str:
    for key in keys:
        value = os.environ.get(key, "").strip().rstrip("/")
        if value:
            return value
    return ""


def _normalize_https_url(url: str) -> str:
    """Ensure router URLs have a scheme (VeilStream env vars are sometimes host-only)."""
    url = url.strip().rstrip("/")
    if not url:
        return ""
    # VeilStream passes compose ${VAR:-default} literals without expanding them.
    if url.startswith("${"):
        return ""
    if not url.startswith(("http://", "https://")):
        return f"https://{url}"
    return url


# VeilStream auth router (preview OAuth). Unset in production for direct Google login.
VEILSTREAM_AUTH_ROUTER_URL = _normalize_https_url(
    _first_env(
        "VEILSTREAM_AUTH_ROUTER_URL",
        "VEILSTREAM_AUTH_BROKER_URL",
        "REACT_APP_VEILSTREAM_AUTH_ROUTER_URL",
        "REACT_APP_VEILSTREAM_AUTH_BROKER_URL",
    )
)
VEILSTREAM_JWT_AUDIENCE = os.environ.get(
    "VEILSTREAM_JWT_AUDIENCE", "veilstream-preview-auth"
)

dir_path = os.path.dirname(os.path.realpath(__file__))
CONFIG_DIR = os.environ.get("TT_CONFIG_DIR", os.path.join(dir_path, "../config"))
