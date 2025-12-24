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
from api.utils.u_state import load_state, set_engine_status, update_key

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

@api_bp.route('/engine/status', methods=['POST'])
def engine_status():
    data = request.json
    if not data or 'module' not in data or 'ready' not in data:
        return jsonify({"error": "Bad Request"}), 400

    set_engine_status(data['module'], data['ready'])
    
    return jsonify({"status": "acknowledged"}), 200

@api_bp.route('/status', methods=['GET'])
def get_status():
    return jsonify(load_state())

@api_bp.route('/toggle', methods=['POST'])
def toggle_state():
    data = request.json
    
    # Basic Validation
    if not data or 'module' not in data or 'active' not in data:
        return jsonify({"error": "Bad Request: Missing module or active state"}), 400

    key_map = {
        "voice": "voice_active",
        "hand": "hand_active"
    }
    
    target_key = key_map.get(data['module'])
    
    if target_key:
        update_key(target_key, data['active'])

        new_state = load_state()
        return jsonify({
            "status": "success", 
            "voice_active": new_state['voice_active'],
            "hand_active": new_state['hand_active']
        }), 200
    
    return jsonify({"error": "Invalid module name"}), 400

app.register_blueprint(api_bp)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)