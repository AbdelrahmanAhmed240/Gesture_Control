import requests
import sys
import os

# Path Fix
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from CONFIG import Config

# Shortcuts
base_url = f"{Config.API_BASE_URL}/me/player"
a = "Authorization"
b = "Bearer"

def play_playback(token):
    url = f"{base_url}/play"
    headers = {a: f"{b} {token}"}
    
    response = requests.put(url, headers=headers)
    return response

def pause_playback(token):
    url = f"{base_url}/pause"
    headers = {a: f"{b} {token}"}
    
    response = requests.put(url, headers=headers)
    return response

def skip_next(token):
    url = f"{base_url}/next"
    headers = {a: f"{b} {token}"}

    response = requests.post(url, headers=headers)
    return response

def skip_previous(token):
    url = f"{base_url}/previous"
    headers = {a: f"{b} {token}"}

    response = requests.post(url, headers=headers)
    return response

def get_playback_state(token):
    url = base_url
    headers = {a: f"{b} {token}"}

    response = requests.get(url, headers=headers)
    return response

def get_devices(token):
    """Fetches list of available devices"""
    url = f"{base_url}/devices"
    headers = {a: f"{b} {token}"}
    return requests.get(url, headers=headers)
