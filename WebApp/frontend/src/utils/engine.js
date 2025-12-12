const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const getEngineStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (res.ok) {
      // Returns: { voice_active: bool, hand_active: bool, voice_ready: boo;, hand_ready:bool }
      return await res.json();
    }
  } catch (err) {
    console.error("Failed to get engine status", err);
  }
  return null;
};

export const toggleModule = async (moduleName, isActive) => {
  try {
    await fetch(`${API_BASE}/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ module: moduleName, active: isActive }),
    });
    return true;
  } catch (err) {
    console.error(`Failed to toggle ${moduleName}`, err);
    return false;
  }
};
