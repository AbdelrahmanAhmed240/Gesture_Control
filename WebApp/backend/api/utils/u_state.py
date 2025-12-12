import json
import os

STATUS_FILE = 'system_status.json'

DEFAULT_STATE = {
    "voice_active": False,
    "hand_active": False,
    "voice_ready": False,
    "hand_ready": False
}

def load_state():
    if not os.path.exists(STATUS_FILE):
        save_state(DEFAULT_STATE)
        return DEFAULT_STATE
    try:
        with open(STATUS_FILE, 'r') as f:
            return json.load(f)
    except:
        return DEFAULT_STATE

def save_state(state):
    with open(STATUS_FILE, 'w') as f:
        json.dump(state, f, indent=4)

def set_engine_status(module, is_ready):
    state = load_state()
    key = f"{module}_ready"
    if key in state:
        state[key] = is_ready
        save_state(state)
        print(f"STATE UPDATE: {key} -> {is_ready}")

def update_key(key, value):
    state = load_state()
    if key in state:
        state[key] = value
        save_state(state)
        print(f"STATE UPDATE: {key} -> {value}")