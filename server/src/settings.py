import os

GOOGLE_CLIENT_ID = "965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"

# VeilStream auth broker (preview OAuth). Unset in production for direct Google login.
VEILSTREAM_AUTH_BROKER_URL = os.environ.get("VEILSTREAM_AUTH_BROKER_URL", "").rstrip("/")
VEILSTREAM_JWT_AUDIENCE = os.environ.get(
    "VEILSTREAM_JWT_AUDIENCE", "veilstream-preview-auth"
)

dir_path = os.path.dirname(os.path.realpath(__file__))
CONFIG_DIR = os.environ.get("TT_CONFIG_DIR", os.path.join(dir_path, "../config"))
