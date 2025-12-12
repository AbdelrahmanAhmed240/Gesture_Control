const API_BASE = "http://127.0.0.1:5000/api/player";

/**
 * Generic helper to send commands.
 * We don't need to handle errors here extensively because:
 * 1. The Backend handles the error logic.
 * 2. The App.jsx polling will pick up any System Error caused by these.
 */
const sendCommand = async (endpoint) => {
  try {
    await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(`Failed to send ${endpoint} command`, err);
  }
};

export const play = () => sendCommand("play");
export const pause = () => sendCommand("pause");
export const next = () => sendCommand("next");
export const previous = () => sendCommand("previous");

export const fetchDevices = async () => {
  try {
    const res = await fetch(`${API_BASE}/devices`);
    if (res.ok) {
      const data = await res.json();
      return data || [];
    }
    return [];
  } catch (err) {
    console.error("Failed to fetch devices", err);
    return [];
  }
};
