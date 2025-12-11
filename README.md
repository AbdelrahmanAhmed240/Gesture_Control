# Startify Project 🎵🖐️🎤

**Startify** is an IoT-based Spotify controller that uses Computer Vision (Hand Gestures) and Speech Recognition to control music playback. This project integrates a Flask backend with a React frontend and Python-based AI engines.

---

## 1. 📂 Project Structure

Current architecture as of **Checkpoint v1.1**.

### **A. Backend Structure (`/backend`)**

The brain of the operation. It handles Authentication, State Management, and communication between the AI Engine and the Frontend.

- **`CONFIG.py`** → Central configuration (Secrets, URLs, Error Codes, Scopes).
- **`api/`** → Core Flask Logic.
  - `server.py` → **Main Entry Point**. Handles System Status & App Initialization.
  - `auth.py` → **Auth Routes**. Handles `/login`, `/callback`, and internal token retrieval.
  - `state.py` → **State Manager**. Holds the `CURRENT_TOKEN` and System Active status (`[Voice, Hand]`).
  - `utils/u_auth.py` → **Helpers**. Pure logic for generating Spotify URLs and requesting tokens.
- **`engine/`** → Python AI Scripts.
  - `hand_tracking.py` → _[🚧 Not Implemented Yet]_
  - `voice_control.py` → _[🚧 Not Implemented Yet]_

### **B. Frontend Structure (`/frontend`)**

- _[🚧 Empty - React App Setup Pending]_

---

## 2. 🚀 How to Run the App

_(Initial instructions after cloning - To be updated)_

- _[🚧 Empty for now]_

---

## 3. 🛠️ Debugging and Testing (Backend Only)

Since the frontend is not ready, use these manual tests to verify the Backend API is functioning correctly.

### **1. Check System Status**

Verifies if the server is running and checks the default state of the AI modules.

- **URL:** `http://127.0.0.1:5000/api/status`
- **Method:** `GET`
- **Expected Result:**
  ```json
  {
    "voice_active": false,
    "hand_active": false,
    "logged_in": false
  }
  ```
