import os
import urllib.parse
import requests
from flask import Flask, redirect, request, jsonify, session
from flask_cors import CORS
from dotenv import load_dotenv

CURRENT_TOKEN = None
SYSTEM_ACTIVE = False

load_dotenv()

class Config:
    CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

    REDIRECT_URI = 'http://127.0.0.1:5000/callback' 

    FRONTEND_URI = 'http://localhost:5173'
    
    AUTH_URL = 'https://accounts.spotify.com/authorize'
    TOKEN_URL = 'https://accounts.spotify.com/api/token'
    API_BASE_URL = 'https://api.spotify.com/v1'

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

def get_auth_url(scope):
    params = {
        'client_id': Config.CLIENT_ID,
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
        'client_id': Config.CLIENT_ID,
        'client_secret': Config.CLIENT_SECRET
    }
    response = requests.post(Config.TOKEN_URL, data=req_body)
    return response.json()

def get_user_profile(access_token):
    headers = {'Authorization': f"Bearer {access_token}"}
    response = requests.get(f"{Config.API_BASE_URL}/me", headers=headers)
    return response.json()

@app.route('/login')
def login():
    scope = 'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-email user-read-private'
    return redirect(get_auth_url(scope))

@app.route('/callback')
def callback():
    if 'error' in request.args:
        return jsonify({"error": request.args['error']})
    
    if 'code' in request.args:
        token_data = get_token(request.args['code'])
        global CURRENT_TOKEN
        CURRENT_TOKEN = token_data['access_token']

        if 'access_token' not in token_data:
             return jsonify({"error": "Failed to retrieve token", "details": token_data})
        
        params = {
            'access_token': token_data['access_token'],
            'refresh_token': token_data['refresh_token'],
            'expires_in': token_data['expires_in']
        }
        redirect_url = f"{Config.FRONTEND_URI}?{urllib.parse.urlencode(params)}"

        
        
        return redirect(redirect_url)
            
    return jsonify({"error": "No code provided"})

@app.route('/internal/token')
def get_internal_token():
    if CURRENT_TOKEN:
        return jsonify({"token": CURRENT_TOKEN})
    return jsonify({"error": "No user logged in yet"}), 40


@app.route('/api/toggle', methods=['POST'])
def toggle_system():
    """React calls this to turn the system ON/OFF."""
    global SYSTEM_ACTIVE
    data = request.json
    # Allow explicit setting (True/False) or just flip it if no data sent
    if data and 'active' in data:
        SYSTEM_ACTIVE = data['active']
    else:
        SYSTEM_ACTIVE = not SYSTEM_ACTIVE
        
    status = "ACTIVE" if SYSTEM_ACTIVE else "INACTIVE"
    print(f"🔌 System Toggled: {status}")
    return jsonify({"status": "success", "active": SYSTEM_ACTIVE})

@app.route('/internal/status')
def get_status():
    """Python Scripts call this to know if they should work or sleep."""
    # We combine the Token check and the Active check here
    if CURRENT_TOKEN and SYSTEM_ACTIVE:
        return jsonify({"active": True, "token": CURRENT_TOKEN})
    elif CURRENT_TOKEN and not SYSTEM_ACTIVE:
        return jsonify({"active": False, "reason": "paused_by_user"})
    else:
        return jsonify({"active": False, "reason": "no_token"}), 404

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)