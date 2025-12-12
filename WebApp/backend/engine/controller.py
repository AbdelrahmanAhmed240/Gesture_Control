import requests
import time

# The Address of your Flask Brain
BASE_URL = "http://127.0.0.1:5000/api"

class SystemController:
    def __init__(self):
        self.voice_active = False
        self.hand_active = False
        self.last_poll = 0
        self.poll_rate = 1.0 

    def sync_system_status(self):
        if time.time() - self.last_poll < self.poll_rate:
            return self.voice_active, self.hand_active

        try:
            res = requests.get(f"{BASE_URL}/status")
            if res.status_code == 200:
                data = res.json()
                self.voice_active = data.get('voice_active', False)
                self.hand_active = data.get('hand_active', False)
                self.last_poll = time.time()
        except Exception as e:
            print(f"❌ [CONTROLLER] Sync Failed: {e}")
            # if server is down, default to inactive
            self.voice_active = False
            self.hand_active = False
        
        return self.voice_active, self.hand_active

    def set_engine_status(self, module_name, is_ready):
        url = f"{BASE_URL}/engine/status"
        try:
            payload = {"module": module_name, "ready": is_ready}
            requests.post(url, json=payload)
            state = "ONLINE" if is_ready else "OFFLINE"
            print(f"📡 [CONTROLLER] {module_name} is {state}")
        except Exception as e:
            print(f"[CONTROLLER] Heartbeat Failed: {e}")

    def send_command(self, command):
        print(f"[CONTROLLER] Sending: {command.upper()}")
        try:
            res = requests.post(f"{BASE_URL}/player/{command}")
            if res.status_code != 200:
                print(f"[CONTROLLER] Command Failed: {res.text}")
        except Exception as e:
            print(f"[CONTROLLER] Network Error: {e}")

    # --- Shortcuts ---
    def play(self): self.send_command('play')
    def pause(self): self.send_command('pause')
    def next(self): self.send_command('next')
    def previous(self): self.send_command('previous')