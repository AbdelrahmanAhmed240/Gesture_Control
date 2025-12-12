class AppState:
    CURRENT_TOKEN = None
    SYSTEM_ACTIVE = [False, False] # [Voice, Hand Tracking]
    ERROR_STATE = {
        "code": None,
        "message": None,
        "dev_info": None
    } # Ex: { "code": 404, "message": "Microphone not detected!", "dev_info": "Additional debug info..." }