#include <Wire.h>
#include "I2Cdev.h"
#include "MPU6050.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define LED_BUILTIN 2

MPU6050 mpu;
int16_t ax, ay, az;

// ==================== DEBOUNCE ====================
unsigned long lastActionTime = 0;
const unsigned long debounceDelay = 500;

unsigned long lastButtonTime = 0;
const unsigned long buttonDebounce = 10;  // Separate debounce for buttons

// ==================== WIFI ====================
const char* ssid = "POCO";
const char* password = "12345678910";

// ==================== BACKEND URLs ====================
const char* BACKEND_HOST = "http://10.157.199.149:5000";

String API_PLAY     = String(BACKEND_HOST) + "/api/player/play";
String API_PAUSE    = String(BACKEND_HOST) + "/api/player/pause";
String API_NEXT     = String(BACKEND_HOST) + "/api/player/next";
String API_PREVIOUS = String(BACKEND_HOST) + "/api/player/previous";
String API_STATUS   = String(BACKEND_HOST) + "/api/status";
String API_TOGGLE   = String(BACKEND_HOST) + "/api/toggle";

// ==================== PUSH BUTTONS ====================
#define BUTTON_VOICE 15    // Toggle Voice Control
#define BUTTON_HAND 4   // Toggle Hand Gesture

bool lastVoiceButtonState = HIGH;
bool lastHandButtonState = HIGH;

// Cached module states (updated on toggle)
bool voiceActive = false;
bool handActive = false;

// ==================== ULTRASONIC ====================
#define TRIG_PIN 5
#define ECHO_PIN 18
float distanceThreshold = 10.0;
bool isPaused = false;

// ==================== TOGGLE MODULE FUNCTION ====================
void toggleModule(const char* moduleName, bool newState) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(API_TOGGLE);
  http.addHeader("Content-Type", "application/json");

  // Create JSON: {"module": "voice", "active": true}
  StaticJsonDocument<128> doc;
  doc["module"] = moduleName;
  doc["active"] = newState;
  
  String payload;
  serializeJson(doc, payload);

  Serial.printf("🔘 Toggling %s → %s\n", moduleName, newState ? "ON" : "OFF");

  int httpCode = http.POST(payload);
  
  if (httpCode == 200) {
    String response = http.getString();
    Serial.printf("✅ Toggle success: %s\n", response.c_str());
    
    // Parse response to update cached states
    StaticJsonDocument<256> resDoc;
    if (!deserializeJson(resDoc, response)) {
      voiceActive = resDoc["voice_active"] | false;
      handActive = resDoc["hand_active"] | false;
    }
  } else {
    Serial.printf("❌ Toggle failed. HTTP: %d\n", httpCode);
  }
  
  http.end();
}

// ==================== FETCH CURRENT STATUS ====================
void fetchStatus() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(API_STATUS);
  
  int httpCode = http.GET();
  
  if (httpCode == 200) {
    String response = http.getString();
    StaticJsonDocument<256> doc;
    
    if (!deserializeJson(doc, response)) {
      voiceActive = doc["voice_active"] | false;
      handActive = doc["hand_active"] | false;
      
      Serial.printf("📊 Voice: %s | Hand: %s\n", 
                    voiceActive ? "ON" : "OFF",
                    handActive ? "ON" : "OFF");
    }
  }
  
  http.end();
}

// ==================== PLAYER API ====================
void callPlayerAPI(const String& url, const char* actionName) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected");
    return;
  }

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  
  int httpCode = http.POST("{}");
  
  Serial.printf("🎵 %s | HTTP: %d\n", actionName, httpCode);
  
  http.end();
}

void playAction()     { callPlayerAPI(API_PLAY, "PLAY"); isPaused = false; }
void pauseAction()    { callPlayerAPI(API_PAUSE, "PAUSE"); isPaused = true; }
void nextAction()     { callPlayerAPI(API_NEXT, "NEXT"); }
void previousAction() { callPlayerAPI(API_PREVIOUS, "PREVIOUS"); }

// ==================== ULTRASONIC ====================
float getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1;
  
  return duration * 0.034 / 2;
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  delay(1000);

  // MPU6050
  mpu.initialize();
  Serial.println(mpu.testConnection() ? "✅ MPU6050 ready" : "❌ MPU6050 failed");

  // Pins
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUTTON_VOICE, INPUT_PULLUP);
  pinMode(BUTTON_HAND, INPUT_PULLUP);

  // WiFi
  Serial.print("📶 Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("\n✅ WiFi connected!");
  Serial.printf("📍 IP: %s\n", WiFi.localIP().toString().c_str());

  // Fetch initial status
  fetchStatus();
}

// ==================== LOOP ====================
void loop() {
  unsigned long now = millis();

  // ==================== PUSH BUTTONS ====================
  bool currentVoiceState = digitalRead(BUTTON_VOICE);
  bool currentHandState = digitalRead(BUTTON_HAND);

  // VOICE BUTTON - Falling edge (HIGH → LOW = pressed)
  if (lastVoiceButtonState == HIGH && currentVoiceState == LOW) {
    if (now - lastButtonTime > buttonDebounce) {
      Serial.println("🔘 Voice button pressed!");
      toggleModule("voice", !voiceActive);  // Toggle opposite state
      lastButtonTime = now;
    }
  }
  lastVoiceButtonState = currentVoiceState;

  // HAND BUTTON - Falling edge
  if (lastHandButtonState == HIGH && currentHandState == LOW) {
    if (now - lastButtonTime > buttonDebounce) {
      Serial.println("🔘 Hand button pressed!");
      toggleModule("hand", !handActive);  // Toggle opposite state
      lastButtonTime = now;
    }
  }
  lastHandButtonState = currentHandState;

  // ==================== IMU GESTURES (UNTOUCHED) ====================
  mpu.getAcceleration(&ax, &ay, &az);

  float ax_g = ax / 16384.0;
  float ay_g = ay / 16384.0;
  float az_g = az / 16384.0;

  if (now - lastActionTime > debounceDelay) {
    if (ax_g >= 0.80 && ax_g <= 1.05) {
      previousAction();
      lastActionTime = now;
    } else if (ax_g <= -0.80 && ax_g >= -1.05) {
      nextAction();
      lastActionTime = now;
    } else if (ay_g >= 0.80 && ay_g <= 1.05) {
      pauseAction();
      lastActionTime = now;
    } else if (ay_g <= -0.80 && ay_g >= -1.05) {
      playAction();
      lastActionTime = now;
    }
  }

  // ==================== ULTRASONIC (UNTOUCHED) ====================
  float distance = getDistance();
  
  if (distance > 0 && distance <= distanceThreshold && now - lastActionTime > debounceDelay) {
    if (!isPaused) {
      pauseAction();
    } else {
      playAction();
    }
    lastActionTime = now;
  }

  delay(100);
}
