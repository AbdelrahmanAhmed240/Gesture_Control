from flask import Blueprint, jsonify
from api.state import AppState
from api.utils.u_user import get_user_profile
from api.utils.u_server import set_error_state, clear_error_state

user_bp = Blueprint('user', __name__, url_prefix='/api/user')

@user_bp.route('/profile', methods=['GET'])
def profile():
    # 1. Check Token
    if not AppState.CURRENT_TOKEN:
        return jsonify({"error": "No User Logged In"}), 401

    # 2. Call Spotify
    res = get_user_profile(AppState.CURRENT_TOKEN)

    # 3. Handle Response
    if res.status_code == 200:
        return jsonify(res.json()), 200
    
    # Optional: We don't necessarily trigger a RED SCREEN system error just for 
    # failing to load a profile picture, so we just return the error JSON.
    return jsonify({"error": "Failed to fetch profile", "details": res.json()}), res.status_code