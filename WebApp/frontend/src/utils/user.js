const API_BASE = "http://127.0.0.1:5000/api/user";

export const fetchUserProfile = async () => {
  try {
    const res = await fetch(`${API_BASE}/profile`);
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error("Failed to load user profile", err);
    return null;
  }
};
