import React, { useState, useEffect } from "react";
import Header from "./Header";
import PlayerStage from "./PlayerStage";
import Controls from "./Controls";
import { fetchUserProfile } from "../utils/user";
import { play, pause, next, previous } from "../utils/player";

const Dashboard = ({ isSystemActive, onToggleSystem }) => {
  const [user, setUser] = useState(null);
  const [playerState, setPlayerState] = useState(null);

  // 1. Fetch User (Once)
  useEffect(() => {
    const loadUser = async () => {
      const userData = await fetchUserProfile();
      setUser(userData);
    };
    loadUser();
  }, []);

  // 2. Poll Player State (Every 1s)
  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch("http://127.0.0.1:5000/api/player/state");
        if (res.ok) {
          const data = await res.json();
          setPlayerState(data);
        }
      } catch (e) {
        console.error("Sync error", e);
      }
    };

    // Run immediately then loop
    fetchState();
    const interval = setInterval(fetchState, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-[#121212] text-white font-sans flex flex-col overflow-hidden">
      <Header
        user={user}
        systemActive={isSystemActive}
        onToggleSystem={onToggleSystem}
      />

      {/* The Stage now gets the real data */}
      <PlayerStage playerState={playerState} />

      {/* The Controls now get real data + handlers */}
      <Controls
        playerState={playerState}
        onPlay={play}
        onPause={pause}
        onNext={next}
        onPrev={previous}
      />
    </div>
  );
};

export default Dashboard;
