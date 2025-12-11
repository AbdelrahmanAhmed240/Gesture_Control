// src/utils/token.js

export const getClientToken = async (clientId, clientSecret) => {
  const tokenEndpoint = "https://accounts.spotify.com/api/token";

  // 1. Construct the body as x-www-form-urlencoded
  const payload = new URLSearchParams();
  payload.append("grant_type", "client_credentials");
  payload.append("client_id", clientId);
  payload.append("client_secret", clientSecret);

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Spotify Auth Error: ${
          errorData.error_description || response.statusText
        }`
      );
    }

    const data = await response.json();

    // Returns the access token (valid for 1 hour)
    return data.access_token;
  } catch (error) {
    console.error("Failed to retrieve Client Credentials Token:", error);
    return null;
  }
};

// Add this to src/utils/token.js

export const searchTrack = async (token, songName) => {
  const endpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
    songName
  )}&type=track&limit=1`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Search failed");
    }

    const data = await response.json();
    return data.tracks.items[0]; // Return the first result
  } catch (error) {
    console.error("Search Error:", error);
    return null;
  }
};
