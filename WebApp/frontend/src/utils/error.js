const API_BASE = "http://127.0.0.1:5000/api";

export const checkSystemHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/error`);
    const data = await res.json();

    if (data && data.code) {
      return data;
    }
    return null;
  } catch (err) {
    console.error("Backend unreachable", err);
    return {
      code: 500,
      message: "Backend unreachable",
      dev_info: err.toString(),
    };
  }
};
