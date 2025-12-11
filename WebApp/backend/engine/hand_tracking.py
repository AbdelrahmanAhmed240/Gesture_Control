import cv2
import mediapipe as mp
import time
import requests
import threading

# --- CONFIG ---
SERVER_URL = "http://127.0.0.1:5000"
SPOTIFY_API = "https://api.spotify.com/v1/me/player"
COOLDOWN = 2.0
SWIPE_MIN_SPEED = 50

class HandController:
    def __init__(self):
        self.mpHands = mp.solutions.hands
        self.hands = self.mpHands.Hands(max_num_hands=1, min_detection_confidence=0.7)
        self.mpDraw = mp.solutions.drawing_utils
        self.token = None
        self.last_action_time = 0
        self.prev_x = None

    def check_status(self):
        try:
            res = requests.get(f"{SERVER_URL}/internal/status")
            if res.status_code == 200:
                data = res.json()
                if data.get('active'):
                    self.token = data.get('token')
                    return True # GO!
                else:
                    print("System Paused...", end='\r')
                    return False # STOP!
            else:
                print("⏳ Waiting for Login...", end='\r')
                return False
        except:
            return False

    def get_token(self):
        print("Vision Engine: Waiting for Token...")
        while not self.token:
            try:
                res = requests.get(f"{SERVER_URL}/internal/token")
                if res.status_code == 200:
                    self.token = res.json().get('token')
                    print("✅ Vision Engine: Connected & Active!")
                else:
                    time.sleep(2)
            except:
                time.sleep(2)

    def send_cmd(self, method, endpoint):
        if not self.token: return
        def _thread():
            headers = {"Authorization": f"Bearer {self.token}"}
            url = f"{SPOTIFY_API}/{endpoint}"
            try:
                if method == 'PUT': requests.put(url, headers=headers)
                elif method == 'POST': requests.post(url, headers=headers)
                print(f"📡 Gesture Sent: {endpoint.upper()}")
            except: pass
        threading.Thread(target=_thread).start()

    def count_fingers_up(self, lmList):
        fingers = [8, 12, 16, 20]
        knuckles = [6, 10, 14, 18]
        up_count = 0
        
        # Thumb
        if lmList[4][1] > lmList[3][1]: up_count += 1
        # Others
        for i in range(4):
            if lmList[fingers[i]][2] < lmList[knuckles[i]][2]: up_count += 1
        return up_count

    def start(self):
        self.get_token()
        cap = cv2.VideoCapture(0)
        
        print("\n📷 GESTURES ACTIVE")
        print("✊ Fist = Pause | 🖐 Open = Play | 👋 Swipe = Next/Prev")

        while True:
            if not self.check_status():
                time.sleep(1) # Sleep for 1 second to save CPU
                continue
            success, img = cap.read()
            if not success: continue

            img = cv2.flip(img, 1)
            h, w, _ = img.shape
            results = self.hands.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            
            status = "Scanning..."

            if results.multi_hand_landmarks:
                for handLms in results.multi_hand_landmarks:
                    self.mpDraw.draw_landmarks(img, handLms, self.mpHands.HAND_CONNECTIONS)
                    lmList = [[id, int(lm.x * w), int(lm.y * h)] for id, lm in enumerate(handLms.landmark)]
                    
                    curr_time = time.time()
                    if curr_time - self.last_action_time > COOLDOWN:
                        
                        # --- SWIPE LOGIC (Rules 3 & 4) ---
                        curr_x = lmList[8][1]
                        movement = 0
                        if self.prev_x is not None: movement = curr_x - self.prev_x

                        if abs(movement) > SWIPE_MIN_SPEED:
                            if movement > 0: 
                                self.send_cmd('POST', 'next')
                                status = "SWIPE NEXT >>"
                            else: 
                                self.send_cmd('POST', 'previous')
                                status = "<< SWIPE PREV"
                            self.last_action_time = curr_time
                        
                        # --- POSE LOGIC (Rules 1 & 2) ---
                        else:
                            fingers = self.count_fingers_up(lmList)
                            if fingers <= 1:
                                self.send_cmd('PUT', 'pause')
                                status = "✊ PAUSE"
                                self.last_action_time = curr_time
                            elif fingers >= 4:
                                self.send_cmd('PUT', 'play')
                                status = "🖐 PLAY"
                                self.last_action_time = curr_time
                        
                        self.prev_x = curr_x
            else:
                self.prev_x = None

            # UI
            cv2.rectangle(img, (0,0), (w, 50), (0,0,0), -1)
            color = (0, 255, 0) if time.time() - self.last_action_time > COOLDOWN else (0, 0, 255)
            cv2.putText(img, status, (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            cv2.imshow("Startify Vision", img)
            
            if cv2.waitKey(1) & 0xFF == 27: break

        cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    app = HandController()
    app.start()