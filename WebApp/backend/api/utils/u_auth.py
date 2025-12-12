import sys
import os
import urllib.parse
import requests

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from CONFIG import Config

def get_auth_url(scope):
    params = {
        'client_id': Config.SPOTIFY_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': Config.REDIRECT_URI,
        'scope': scope,
        'show_dialog': 'true'
    }
    return f"{Config.AUTH_URL}?{urllib.parse.urlencode(params)}"

def get_token(code):
    req_body = {
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': Config.REDIRECT_URI,
        'client_id': Config.SPOTIFY_CLIENT_ID,
        'client_secret': Config.SPOTIFY_CLIENT_SECRET
    }
    response = requests.post(Config.TOKEN_URL, data=req_body)
    return response.json()