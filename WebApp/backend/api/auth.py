import sys
import os
import urllib.parse
import requests
from flask import Blueprint, redirect, request, jsonify

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from CONFIG import Config
from api.utils.u_auth import get_auth_url, get_token
from api.state import AppState
from api.utils.u_server import set_error_state, clear_error_state

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login')
def login():
    scopes = Config.SCOPES
    scope = ' '.join(scopes)
    auth_url = get_auth_url(scope)
    print(f"Client id: {Config.SPOTIFY_CLIENT_ID}")
    print(f"CLient secret: {Config.SPOTIFY_CLIENT_SECRET}")
    return redirect(auth_url)

@auth_bp.route('/callback')
def callback():
    if 'error' in request.args:
        set_error_state(
            400,
            "Authorization Error",
            "Error returned in callback: " + request.args['error']
        )
        return jsonify({"error": Config.ERRORS[401]}), 401
    
    clear_error_state()

    if 'code' in request.args:
        token_data = get_token(request.args['code'])
        
        if 'access_token' not in token_data:
            set_error_state(
                400,
                "Token Retrieval Error",
                "Failed to retrieve access token: " + str(token_data)
            ) 
            return jsonify({"error": "Failed to retrieve token", "details": token_data})
        
        clear_error_state()
        
        AppState.CURRENT_TOKEN = token_data['access_token']

        params = {
            'access_token': token_data['access_token'],
            'refresh_token': token_data.get('refresh_token'),
            'expires_in': token_data['expires_in']
        }
        redirect_url = f"{Config.FRONTEND_URI}?{urllib.parse.urlencode(params)}"
        
        return redirect(redirect_url)
            
    set_error_state(
        501,
        "Callback Code Retrieval Error",
        "No code provided in callback"
    )
    return jsonify({"error": "No code provided"})

@auth_bp.route('/internal/token')
def get_internal_token():
    if AppState.CURRENT_TOKEN:
        return jsonify({"token": AppState.CURRENT_TOKEN})
    set_error_state(
        404,
        "Token Not Found",
        "No user is currently logged in; CURRENT_TOKEN is None... Error in /internal/token"
    )
    return jsonify({"error": "No user logged in"}), 404