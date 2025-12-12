from flask import Blueprint, jsonify
from api.state import AppState
from api.utils.u_player import play_playback, pause_playback, skip_next, skip_previous, get_playback_state, get_devices
from api.utils.u_server import set_error_state, clear_error_state # <--- ERROR UTILS

player_bp = Blueprint('player', __name__, url_prefix='/api/player')

def get_token_or_set_error(action_name):
    if not AppState.CURRENT_TOKEN:
        msg = f"Failed to {action_name}: User not logged in."
        set_error_state(
            401, 
            msg, 
            f"AppState.CURRENT_TOKEN is None. Action: {action_name}"
        )
        return None, (jsonify({"error": msg}), 401)
    
    return AppState.CURRENT_TOKEN, None

# --- GENERIC HANDLER ---
def handle_spotify_request(action_func, action_name):
    token, error_response = get_token_or_set_error(action_name)
    if error_response:
        return error_response

    res = action_func(token)

    if res.status_code in [200, 201, 204]:
        clear_error_state()
        return jsonify({"status": "success", "action": action_name}), 200
    
    # 4. Handle Spotify API Errors
    try:
        details = res.json()
    except:
        details = res.text

    set_error_state(
        res.status_code, 
        f"Spotify Error: Failed to {action_name}", 
        f"Status: {res.status_code}\nResponse: {str(details)}"
    )
    
    return jsonify({"error": "Spotify API Error", "details": details}), res.status_code


# --- ROUTES ---

@player_bp.route('/play', methods=['POST'])
def play():
    return handle_spotify_request(play_playback, "resume playback")

@player_bp.route('/pause', methods=['POST'])
def pause():
    return handle_spotify_request(pause_playback, "pause playback")

@player_bp.route('/next', methods=['POST'])
def next_track():
    return handle_spotify_request(skip_next, "skip to next track")

@player_bp.route('/previous', methods=['POST'])
def prev_track():
    return handle_spotify_request(skip_previous, "skip to previous track")

@player_bp.route('/state', methods=['GET'])
def current_state():
    token, error_json = get_token_or_set_error("fetch state")
    if error_json: return error_json

    res = get_playback_state(token)

    if res.status_code == 204:
        return jsonify(None), 200

    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch state"}), res.status_code

    data = res.json()

    # Ads or No Track Playing
    if not data.get('item'):
        return jsonify(None), 200

    track = data['item']
    
    response_payload = {
        "is_playing": data['is_playing'],
        "progress_ms": data['progress_ms'],
        "item": {
            "name": track['name'],
            "duration_ms": track['duration_ms'],
            "artists": [{"name": artist['name']} for artist in track['artists']],
            "album": {
                "images": track['album']['images'] # [0] is usually 640x640
            }
        },
        "device": {
            "name": data['device']['name'],
            "volume_percent": data['device']['volume_percent']
        }
    }

    return jsonify(response_payload), 200


@player_bp.route('/devices', methods=['GET'])
def list_devices():
    token, error_json = get_token_or_set_error("fetch state")
    if error_json: return error_json

    res = get_devices(token)
    
    data = res.json()

    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch devices"}), res.status_code
    return jsonify(data['devices']), 200