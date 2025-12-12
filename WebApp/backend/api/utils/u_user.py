import requests
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from CONFIG import Config

def get_user_profile(token):
    """Fetches the current user's profile from Spotify"""
    url = f"{Config.API_BASE_URL}/me"
    headers = {"Authorization": f"Bearer {token}"}
    
    response = requests.get(url, headers=headers)
    return response