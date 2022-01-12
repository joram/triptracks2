import os

GOOGLE_CLIENT_ID = "965794564715-ebal2dv5tdac3iloedmnnb9ph0lptibp.apps.googleusercontent.com"

dir_path = os.path.dirname(os.path.realpath(__file__))
CONFIG_DIR = os.environ.get("TT_CONFIG_DIR", os.path.join(dir_path, "../config"))
