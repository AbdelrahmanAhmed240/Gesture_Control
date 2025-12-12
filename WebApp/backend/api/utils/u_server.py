import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from CONFIG import Config
from api.state import AppState

def set_error_state(code, message, dev_info):
    AppState.ERROR_STATE['code'] = code
    AppState.ERROR_STATE['message'] = message
    AppState.ERROR_STATE['dev_info'] = dev_info

def clear_error_state():
    AppState.ERROR_STATE['code'] = None
    AppState.ERROR_STATE['message'] = None
    AppState.ERROR_STATE['dev_info'] = None