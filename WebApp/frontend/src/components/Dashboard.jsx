import React, { useEffect, useState, useRef } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
  MdSkipNext,
  MdSkipPrevious,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
  MdVolumeUp,
  MdDevices,
  MdLaptopMac,
  MdSmartphone,
  MdPowerSettingsNew,
} from "react-icons/md";

const spotify = new SpotifyWebApi();

function Dashboard({ token }) {
  const [user, setUser] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const progressInterval = useRef(null);
  const [localProgress, setLocalProgress] = useState(0); // For smooth progress bar
  const [systemActive, setSystemActive] = useState(false);

  useEffect(() => {
    spotify.setAccessToken(token);
    spotify.getMe().then(setUser);
    refreshState();

    // Poll slower for state (every 3s), but we will simulate progress locally
    const poller = setInterval(refreshState, 3000);

    // Simulate progress bar moving every second
    progressInterval.current = setInterval(() => {
      setLocalProgress((prev) => prev + 1000);
    }, 1000);

    return () => {
      clearInterval(poller);
      clearInterval(progressInterval.current);
    };
  }, [token]);

  const refreshState = () => {
    // 1. Get Playback
    spotify
      .getMyCurrentPlaybackState()
      .then((data) => {
        if (data && data.item) {
          setPlayerState(data);
          setLocalProgress(data.progress_ms); // Sync up
          setActiveDevice(data.device);
        } else {
          setPlayerState(null);
        }
      })
      .catch((err) => {
        if (err.status === 401) window.location.href = "/"; // Auto-logout
      });

    // 2. Get Devices
    spotify.getMyDevices().then((data) => setDevices(data.devices));
  };

  const handleDeviceTransfer = (deviceId) => {
    spotify.transferMyPlayback([deviceId]).then(() => {
      setTimeout(refreshState, 1000); // Wait for transfer
    });
  };

  // Safe Controls
  const togglePlay = () =>
    playerState?.is_playing
      ? spotify.pause().then(refreshState)
      : spotify.play().then(refreshState);
  const skipNext = () => spotify.skipToNext().then(refreshState);
  const skipPrev = () => spotify.skipToPrevious().then(refreshState);

  // Format Time (ms -> mm:ss)
  const fmtTime = (ms) => {
    if (!ms) return "0:00";
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(0);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const toggleSystem = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !systemActive }),
      });
      const data = await res.json();
      setSystemActive(data.active);
    } catch (err) {
      console.error("Failed to toggle system", err);
    }
  };

  if (!user)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-green-500">
        Loading Command Center...
      </div>
    );

  return (
    <div className="h-screen bg-[#121212] text-white font-sans flex flex-col overflow-hidden">
      {/* --- TOP BAR: USER & DEVICES --- */}
      <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-[#282828]">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-bold tracking-wider text-sm text-gray-400">
            STARTIFY CONTROLLER v1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-300">
            {user.display_name}
          </span>
          {user.images?.[0] && (
            <img
              src={user.images[0].url}
              className="w-8 h-8 rounded-full"
              alt="User"
            />
          )}
        </div>
        <button
          onClick={toggleSystem}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
            systemActive
              ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]"
              : "bg-red-900/50 text-red-200 border border-red-800"
          }`}
        >
          <MdPowerSettingsNew size={20} />
          {systemActive ? "SYSTEM ACTIVE" : "SYSTEM OFF"}
        </button>
      </div>

      {/* --- MAIN CONTENT AREA (The "Stage") --- */}
      <div className="flex-1 flex relative">
        {/* Background Blur */}
        <div
          className="absolute inset-0 z-0 opacity-20 bg-center bg-cover blur-3xl transition-all duration-1000"
          style={{
            backgroundImage: `url(${playerState?.item?.album.images[0]?.url})`,
          }}
        ></div>

        <div className="z-10 w-full flex flex-col items-center justify-center p-10">
          {playerState ? (
            <div className="flex flex-col items-center animate-fade-in-up">
              <img
                src={playerState.item.album.images[0].url}
                className="w-64 h-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded mb-8"
                alt="Album"
              />
              <h1 className="text-4xl font-bold mb-2 text-center max-w-2xl">
                {playerState.item.name}
              </h1>
              <h2 className="text-xl text-gray-400 mb-8">
                {playerState.item.artists.map((a) => a.name).join(", ")}
              </h2>

              {/* Device Selector */}
              <div className="flex gap-4 mb-8">
                {devices.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleDeviceTransfer(d.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition ${
                      d.id === activeDevice?.id
                        ? "bg-green-500 text-black"
                        : "bg-[#282828] text-gray-400 hover:text-white"
                    }`}
                  >
                    {d.type === "Smartphone" ? (
                      <MdSmartphone />
                    ) : (
                      <MdLaptopMac />
                    )}
                    {d.name} {d.id === activeDevice?.id && "(Active)"}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 flex flex-col items-center">
              <MdDevices size={64} className="mb-4 opacity-50" />
              <p className="text-xl">No Active Session Found</p>
              <p className="text-sm mt-2">
                Open Spotify on a device to begin control.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- BOTTOM CONTROL BAR (Fixed) --- */}
      <div className="h-24 bg-[#181818] border-t border-[#282828] px-6 flex items-center justify-between z-20">
        {/* Left: Mini Track Info */}
        <div className="w-1/3 flex items-center gap-4">
          {playerState && (
            <>
              <img
                src={playerState.item.album.images[0].url}
                className="w-14 h-14 rounded shadow-sm"
                alt="Mini Art"
              />
              <div className="hidden md:block">
                <div className="text-sm font-bold hover:underline cursor-pointer">
                  {playerState.item.name}
                </div>
                <div className="text-xs text-gray-400">
                  {playerState.item.artists[0].name}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Center: Playback Controls */}
        <div className="w-1/3 flex flex-col items-center">
          <div className="flex items-center gap-6 mb-2">
            <button
              onClick={skipPrev}
              className="text-gray-400 hover:text-white"
            >
              <MdSkipPrevious size={28} />
            </button>
            <button
              onClick={togglePlay}
              className="text-white hover:scale-105 transition"
            >
              {playerState?.is_playing ? (
                <MdPauseCircleFilled size={44} />
              ) : (
                <MdPlayCircleFilled size={44} />
              )}
            </button>
            <button
              onClick={skipNext}
              className="text-gray-400 hover:text-white"
            >
              <MdSkipNext size={28} />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
            <span>{fmtTime(localProgress)}</span>
            <div className="h-1 flex-1 bg-[#404040] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: `${
                    (localProgress / (playerState?.item.duration_ms || 1)) * 100
                  }%`,
                }}
              ></div>
            </div>
            <span>{fmtTime(playerState?.item.duration_ms)}</span>
          </div>
        </div>

        {/* Right: Volume & Extra */}
        <div className="w-1/3 flex justify-end items-center gap-3">
          <MdVolumeUp size={20} className="text-gray-400" />
          <div className="w-24 h-1 bg-[#404040] rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500"
              style={{ width: `${playerState?.device?.volume_percent || 50}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
