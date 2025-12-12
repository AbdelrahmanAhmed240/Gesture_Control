export const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");

  if (accessToken) {
    localStorage.setItem("access_token", accessToken);
    window.history.pushState({}, null, "/");
    return accessToken;
  }

  const storedToken = localStorage.getItem("spotify_token");
  if (storedToken) {
    return storedToken;
  }

  return null;
};

export const logout = () => {
  localStorage.removeItem("spotify_token");
  window.location.reload();
};
