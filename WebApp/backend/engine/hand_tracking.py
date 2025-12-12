import cv2
import mediapipe as mp
import time
from controller import SystemController

MODULE_NAME = "hand"

# --- CONFIGURATION ---
COMMAND_COOLDOWN = 1  # Seconds between commands

def count_fingers(landmarks):
    """
    Counts extended fingers. Returns (count, list_of_status).
    """
    finger_tips = [8, 12, 16, 20] # Index, Middle, Ring, Pinky
    finger_pips = [6, 10, 14, 18] # Knuckles
    
    status = []
    
    # Check 4 Fingers (Excluding Thumb for simplicity)
    for tip, pip in zip(finger_tips, finger_pips):
        # In screen coordinates, Y=0 is top. So Tip < Pip means extended UP.
        # But since hand might be rotated, we calculate distance from wrist instead.
        # However, for this specific logic, simpler is better:
        
        # We assume "Extended" means the tip is further from the wrist than the knuckle is.
        # (This works regardless of rotation)
        wrist = landmarks[0]
        
        # Euclidean distance squared (faster than sqrt)
        dist_tip = (landmarks[tip].x - wrist.x)**2 + (landmarks[tip].y - wrist.y)**2
        dist_pip = (landmarks[pip].x - wrist.x)**2 + (landmarks[pip].y - wrist.y)**2
        
        if dist_tip > dist_pip:
            status.append(1) # Extended
        else:
            status.append(0) # Folded
            
    return sum(status), status

def detect_gesture(landmarks):
    count, _ = count_fingers(landmarks)
    
    # 1. FIST (0 fingers extended) -> PAUSE
    # We use < 2 to be lenient (sometimes pinky doesn't close fully)
    if count < 1:
        return "pause"
    
    # 2. OPEN PALM (4 or 5 fingers) -> CHECK ROTATION
    if count >= 3:
        # Get coordinates of Wrist (0) and Middle Finger Base (9)
        # We use these to determine the "Spine" of the hand
        wrist = landmarks[0]
        middle_base = landmarks[9]
        
        delta_x = middle_base.x - wrist.x
        delta_y = middle_base.y - wrist.y
        
        # Check Orientation
        # If Horizontal Distance > Vertical Distance -> Hand is Rotated (Sideways)
        if abs(delta_x) > abs(delta_y):
            # ROTATED
            if delta_x > 0:
                # Base is to the RIGHT of wrist (Fingers pointing RIGHT)
                # This mimics "Clockwise" rotation for Right Hand
                return "next"
            else:
                # Base is to the LEFT of wrist (Fingers pointing LEFT)
                # This mimics "Anticlockwise" rotation
                return "previous"
        else:
            # UPRIGHT (Vertical Distance is larger)
            # Only play if hand is pointing UP (y decreases going up)
            if delta_y < 0:
                return "play"
            
    return None

def main():
    controller = SystemController()
    
    print("📷 Initializing Camera...")
    cap = cv2.VideoCapture(0)
    
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5
    )
    mp_draw = mp.solutions.drawing_utils

    # Register Engine
    controller.set_engine_status(MODULE_NAME, True)
    last_command_time = 0
    last_command_name = "None"

    try:
        while True:
            # Poll Permission
            _, hand_active = controller.sync_system_status()

            if not hand_active:
                cv2.destroyAllWindows()
                time.sleep(1)
                continue

            # Process Frame
            success, img = cap.read()
            if not success: continue

            # Mirror the image (so right moves right on screen)
            img = cv2.flip(img, 1)
            
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)

            gesture_command = None
            
            if results.multi_hand_landmarks:
                for hand_lms in results.multi_hand_landmarks:
                    mp_draw.draw_landmarks(img, hand_lms, mp_hands.HAND_CONNECTIONS)
                    
                    gesture_command = detect_gesture(hand_lms.landmark)
                    
                    if gesture_command:
                        # Draw Visual Indicator
                        color = (0, 255, 0) # Green for Play
                        if gesture_command == "pause": color = (0, 0, 255) # Red
                        if gesture_command in ["next", "previous"]: color = (255, 165, 0) # Orange
                        
                        # --- EXECUTE COMMAND (With Cooldown) ---
                        current_time = time.time()
                        if current_time - last_command_time > COMMAND_COOLDOWN:
                            if gesture_command != last_command_name: # prevent spamming same command
                                if gesture_command == "play": controller.play()
                                elif gesture_command == "pause": controller.pause()
                                elif gesture_command == "next": controller.next()
                                elif gesture_command == "previous": controller.previous()
                                
                                last_command_time = current_time
                                last_command_name = gesture_command
                                print(f"👉 EXECUTE: {gesture_command.upper()}")
                        
                        # UI Text
                        cv2.putText(img, f"CMD: {gesture_command.upper()}", (10, 70), 
                                  cv2.FONT_HERSHEY_SIMPLEX, 1, color, 3)

            # Debug Info
            cv2.putText(img, "System Active", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.imshow("Startify Hand Control", img)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

    except KeyboardInterrupt:
        print("\n🛑 Manual Stop")
    except Exception as e:
        print(f"⚠️ Error: {e}")
    finally:
        cap.release()
        cv2.destroyAllWindows()
        controller.set_engine_status(MODULE_NAME, False)
        print("👋 Hand Engine Shutdown.")

if __name__ == "__main__":
    main()