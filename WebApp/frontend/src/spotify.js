export const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = params.get("expires_in");

  if (accessToken) {
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
    };
  }
  return null;
};

export const LOGIN_URL = "http://127.0.0.1:5000/login";
