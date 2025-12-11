import speech_recognition as sr
import requests
import time
import threading

# --- CONFIG ---
SERVER_URL = "http://127.0.0.1:5000"
SPOTIFY_API = "https://api.spotify.com/v1/me/player"

class VoiceController:
    def __init__(self):
        self.token = None
        self.recognizer = sr.Recognizer()

    def get_token(self):
        """Polls Flask until user logs in."""
        print("🎤 Voice Engine: Waiting for Token...")
        while not self.token:
            try:
                res = requests.get(f"{SERVER_URL}/internal/token")
                if res.status_code == 200:
                    self.token = res.json().get('token')
                    print("✅ Voice Engine: Connected & Listening!")
                else:
                    time.sleep(2)
            except:
                time.sleep(2)

    def send_cmd(self, method, endpoint):
        """Sends command to Spotify."""
        if not self.token: return
        headers = {"Authorization": f"Bearer {self.token}"}
        url = f"{SPOTIFY_API}/{endpoint}"
        try:
            if method == 'PUT': requests.put(url, headers=headers)
            elif method == 'POST': requests.post(url, headers=headers)
            print(f"📡 Voice Command Sent: {endpoint.upper()}")
        except Exception as e:
            print(f"❌ Error: {e}")

    def listen(self):
        self.get_token()
        
        # Check Mic
        try:
            mic = sr.Microphone()
        except:
            print("❌ No Microphone Found.")
            return

        with mic as source:
            print("Adjusting for ambient noise...")
            self.recognizer.adjust_for_ambient_noise(source, duration=1)

        print("💬 Say: 'Resume', 'Pause', 'Next', 'Previous'...")

        while True:
            try:
                with mic as source:
                    # Listen with a timeout so it doesn't hang forever
                    audio = self.recognizer.listen(source, timeout=5, phrase_time_limit=3)
                
                command = self.recognizer.recognize_google(audio).lower()
                print(f"🗣 Heard: '{command}'")

                # --- RULES 5, 6, 7, 8 ---
                if any(x in command for x in ["resume", "play", "continue", "start"]):
                    self.send_cmd('PUT', 'play')
                
                elif any(x in command for x in ["stop", "pause", "hush"]):
                    self.send_cmd('PUT', 'pause')
                
                elif any(x in command for x in ["next", "skip"]):
                    self.send_cmd('POST', 'next')
                
                elif any(x in command for x in ["previous", "back"]):
                    self.send_cmd('POST', 'previous')

            except sr.WaitTimeoutError:
                pass # Just keep listening
            except sr.UnknownValueError:
                pass # Didn't catch that
            except Exception as e:
                print(f"⚠️ Error: {e}")

if __name__ == "__main__":
    app = VoiceController()
    app.listen()