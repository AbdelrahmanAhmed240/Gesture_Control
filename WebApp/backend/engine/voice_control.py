import time
import speech_recognition as sr
from controller import SystemController

MODULE_NAME = "voice"

def main():
    # Initialize Controller (The Communication Hub)
    controller = SystemController()
    
    # Initialize Microphone (The Sensor)
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    print("🎤 Calibrating Microphone... Please be silent.")
    with mic as source:
        recognizer.adjust_for_ambient_noise(source, duration=2)
    print("✅ Calibration Complete.")

    # TELL BACKEND: "I AM READY"
    controller.set_engine_status(MODULE_NAME, True)

    try:
        while True:
            voice_active, _ = controller.sync_system_status()

            if not voice_active:
                time.sleep(1)
                continue

            print("🟢 Listening...")
            try:
                with mic as source:
                    audio = recognizer.listen(source, timeout=5, phrase_time_limit=3)
                
                command_text = recognizer.recognize_google(audio).lower()
                print(f"🗣️ Heard: '{command_text}'")

                if "play" in command_text or "start" in command_text:
                    controller.play()
                elif "pause" in command_text or "stop" in command_text:
                    controller.pause()
                elif "next" in command_text or "skip" in command_text:
                    controller.next()
                elif "previous" in command_text or "back" in command_text:
                    controller.previous()

            except sr.WaitTimeoutError:
                pass 
            except sr.UnknownValueError:
                print("🤔 Unclear")
            except sr.RequestError:
                print("❌ Internet Error")
            except Exception as e:
                print(f"⚠️ Error: {e}")

    except KeyboardInterrupt:
        print("\n🛑 Manual Stop")

    finally:
        # TELL BACKEND: "I AM DEAD"
        controller.set_engine_status(MODULE_NAME, False)
        print("👋 Engine Shutdown.")

if __name__ == "__main__":
    main()