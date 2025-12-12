import sys
import os
import urllib.parse
import requests
from flask import Flask, redirect, request, jsonify, session, Blueprint
from flask_cors import CORS

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from CONFIG import Config
from api.state import AppState
from api.utils.u_server import set_error_state, clear_error_state

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

# Tell flask that these blueprints exist
from api.auth import auth_bp
app.register_blueprint(auth_bp)

from api.player import player_bp
app.register_blueprint(player_bp)

from api.user import user_bp
app.register_blueprint(user_bp)

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/error', methods=['GET'])
def get_error_state():
    return jsonify({
        "code": AppState.ERROR_STATE['code'],
        "message": AppState.ERROR_STATE['message'],
        "dev_info": AppState.ERROR_STATE['dev_info']
    })

@api_bp.route('/status', methods=['GET'])
def status():
    return jsonify({
        "voice_active": AppState.SYSTEM_ACTIVE[0],
        "hand_tracking_active": AppState.SYSTEM_ACTIVE[1],
        "logged_in": AppState.CURRENT_TOKEN is not None
    })

@api_bp.route('/toggle', methods=['POST'])
def toggle_state():
    data = request.json
    if not data or 'module' not in data or 'active' not in data:
        set_error_state(
            400,
            "System Error: Failed to parse toggle request",
            "Missing 'module' or 'active' in request data: " + str(data) + "\nFrom /api/toggle\n\nExpected JSON format: { 'module': 'voice'|'hand', 'active': true|false }"
        )
        return jsonify({"Error": Config.ERRORS[400]}), 400
    
    clear_error_state()
    
    if data['module'] == 'voice':
        AppState.SYSTEM_ACTIVE[0] = data['active']
    elif data['module'] == 'hand':
        AppState.SYSTEM_ACTIVE[1] = data['active']

    return jsonify({
        "status": "success",
        "voice_active": AppState.SYSTEM_ACTIVE[0],
        "hand_active": AppState.SYSTEM_ACTIVE[1]
    })

app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)