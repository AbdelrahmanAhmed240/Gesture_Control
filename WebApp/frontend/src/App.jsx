import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ErrorPage from "./globals/ErrorPage";
import { getTokenFromUrl } from "./utils/token";
import { checkSystemHealth } from "./utils/error";

function App() {
  const [token, setToken] = useState(null);
  const [globalError, setGlobalError] = useState(null);
  const [isSystemActive, setIsSystemActive] = useState(false);

  // 1. Token Check
  useEffect(() => {
    const accessToken =
      localStorage.getItem("access_token") || getTokenFromUrl();
    if (accessToken) setToken(accessToken);
  }, []);

  // 2. Smart Heartbeat
  useEffect(() => {
    if (!token) return;
    const poll = async () => {
      const errorData = await checkSystemHealth();
      setGlobalError(errorData);
    };

    poll(); // Initial check

    let interval = null;
    if (isSystemActive) {
      interval = setInterval(poll, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSystemActive]);

  const handleDismiss = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setGlobalError(null);
    setIsSystemActive(false);
    window.location.href = "/";

    setToken(null);
    setGlobalError(null);
    setIsSystemActive(false);

    window.location.href = "/";
  };

  return (
    <>
      <ErrorPage error={globalError} onDismiss={handleDismiss} />

      {token ? (
        <Dashboard
          token={token}
          isSystemActive={isSystemActive}
          onToggleSystem={() => setIsSystemActive(!isSystemActive)}
        />
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
