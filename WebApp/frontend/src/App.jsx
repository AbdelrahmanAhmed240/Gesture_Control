// src/App.jsx
import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { getTokenFromUrl } from "./spotify";

function App() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const tokens = getTokenFromUrl();

    const storedToken = window.localStorage.getItem("spotify_access_token");

    if (tokens) {
      setToken(tokens.access_token);
      window.localStorage.setItem("spotify_access_token", tokens.access_token);
      window.localStorage.setItem(
        "spotify_refresh_token",
        tokens.refresh_token
      );
      window.history.pushState({}, null, "/");
    } else if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  return (
    <div className="app">{token ? <Dashboard token={token} /> : <Login />}</div>
  );
}

export default App;
