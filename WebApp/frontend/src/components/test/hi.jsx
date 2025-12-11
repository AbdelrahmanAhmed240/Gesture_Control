import React, { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import {
  MdPlayArrow,
  MdPause,
  MdSkipNext,
  MdSkipPrevious,
  MdShuffle,
  MdRepeat,
  MdRepeatOne,
  MdVolumeDown,
  MdVolumeUp,
  MdClose,
  MdMusicNote,
} from "react-icons/md";

const spotify = new SpotifyWebApi();

function Dashboard({ token }) {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Player State
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);

  useEffect(() => {
    spotify.setAccessToken(token);
    spotify.getMe().then(setUser);
    fetchPlaybackState();

    const interval = setInterval(fetchPlaybackState, 3000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchPlaybackState = () => {
    spotify.getMyCurrentPlaybackState().then((data) => {
      if (data && data.item) {
        setNowPlaying(data.item);
        setIsPlaying(data.is_playing);
        setShuffle(data.shuffle_state);
        setRepeatMode(
          data.repeat_state === "off"
            ? 0
            : data.repeat_state === "context"
            ? 1
            : 2
        );
        if (data.device?.volume_percent !== null)
          setVolume(data.device.volume_percent);
      }
    });
  };

  // --- CONTROLS ---
  const togglePlay = () =>
    isPlaying
      ? spotify.pause().then(() => setIsPlaying(false))
      : spotify.play().then(() => setIsPlaying(true));
  const skipNext = () => spotify.skipToNext().then(fetchPlaybackState);
  const skipPrev = () => spotify.skipToPrevious().then(fetchPlaybackState);
  const toggleShuffle = () =>
    spotify.setShuffle(!shuffle).then(() => setShuffle(!shuffle));
  const cycleRepeat = () => {
    const modes = ["off", "context", "track"];
    const nextModeIndex = (repeatMode + 1) % 3;
    spotify
      .setRepeat(modes[nextModeIndex])
      .then(() => setRepeatMode(nextModeIndex));
  };
  const changeVolume = (e) => {
    const newVol = e.target.value;
    setVolume(newVol);
    spotify.setVolume(newVol);
  };

  const getSeek = (x) => {
    spotify.seek(x);
  };

  // --- HELPERS ---
  // Get the highest resolution image for the background
  const bgImage = nowPlaying?.album.images[0]?.url || "";

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans selection:bg-green-500 selection:text-black">
      {/* 1. DYNAMIC BACKGROUND LAYER */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 ease-in-out opacity-40 blur-3xl scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      {/* 2. MAIN CONTENT (Z-10) */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        {/* Header */}
        <header className="absolute top-8 left-8 flex items-center gap-4 animate-fade-in-down">
          {user?.images?.[0] ? (
            <img
              src={user.images[0].url}
              className="w-12 h-12 rounded-full border-2 border-white/20 shadow-lg"
              alt="Profile"
            />
          ) : (
            <div className="w-12 h-12 bg-neutral-700 rounded-full" />
          )}
          <div>
            <p className="text-xs text-green-400 font-bold tracking-widest uppercase">
              Startify Connected
            </p>
            <h1 className="text-xl font-bold">{user?.display_name}</h1>
          </div>
        </header>

        {/* Center Prompt */}
        {!isModalOpen && (
          <div className="text-center animate-fade-in-up">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-500">
              Control <br /> Your Vibe.
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(true);
                fetchPlaybackState();
              }}
              className="group relative inline-flex items-center gap-3 bg-green-500 text-black px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
            >
              <MdMusicNote size={24} />
              Launch Remote
              <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
            </button>
          </div>
        )}

        {/* 3. THE REMOTE MODAL (Glassmorphism) */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-300">
            {/* The Card */}
            <div className="relative w-full max-w-sm bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] shadow-2xl flex flex-col items-center">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/20 transition"
              >
                <MdClose size={20} className="text-gray-400" />
              </button>

              {/* Album Art (Vinyl Style Shadow) */}
              <div className="relative w-64 h-64 mb-8 mt-4 group">
                <div className="absolute inset-4 bg-green-500 blur-xl opacity-20 group-hover:opacity-40 transition duration-700" />
                <img
                  src={
                    nowPlaying?.album.images[0]?.url ||
                    "https://via.placeholder.com/400"
                  }
                  alt="Album Art"
                  className={`w-full h-full object-cover rounded-2xl shadow-2xl transition-transform duration-700 ${
                    isPlaying ? "scale-100" : "scale-95 grayscale-[0.3]"
                  }`}
                />
              </div>

              {/* Text Info */}
              <div className="text-center w-full mb-8 space-y-1">
                <h2 className="text-2xl font-bold truncate text-white">
                  {nowPlaying?.name || "Not Playing"}
                </h2>
                <p className="text-gray-400 text-sm truncate font-medium">
                  {nowPlaying?.artists.map((a) => a.name).join(", ") ||
                    "Spotify is idle"}
                </p>
              </div>

              {/* Progress Bar (Visual Only for now) */}
              <div className="w-full h-1 bg-white/10 rounded-full mb-8 overflow-hidden">
                <div
                  className={`h-full bg-green-500 rounded-full ${
                    isPlaying ? "animate-progress-fake" : "w-0"
                  }`}
                  style={{ width: "40%" }}
                />
              </div>

              {/* Main Controls */}
              <div className="flex items-center justify-between w-full mb-8">
                <button
                  onClick={toggleShuffle}
                  className={`${
                    shuffle ? "text-green-500" : "text-gray-500"
                  } hover:text-white transition`}
                >
                  <MdShuffle size={20} />
                </button>
                <button
                  onClick={skipPrev}
                  className="text-white hover:text-green-400 transition hover:-translate-x-1"
                >
                  <MdSkipPrevious size={40} />
                </button>

                {/* Play Button (Neumorphic) */}
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all active:scale-95"
                >
                  {isPlaying ? (
                    <MdPause size={32} />
                  ) : (
                    <MdPlayArrow size={32} className="ml-1" />
                  )}
                </button>

                <button
                  onClick={skipNext}
                  className="text-white hover:text-green-400 transition hover:translate-x-1"
                >
                  <MdSkipNext size={40} />
                </button>
                <button
                  onClick={cycleRepeat}
                  className={`${
                    repeatMode > 0 ? "text-green-500" : "text-gray-500"
                  } hover:text-white transition relative`}
                >
                  <MdRepeat size={20} />
                  {repeatMode === 2 && (
                    <span className="absolute -top-2 -right-1 text-[10px] font-bold">
                      1
                    </span>
                  )}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-3 w-full px-2">
                <MdVolumeDown size={16} className="text-gray-500" />
                <div className="flex-1 relative h-1 bg-white/10 rounded-full group cursor-pointer">
                  <div
                    className="absolute h-full bg-white rounded-full group-hover:bg-green-500 transition-colors"
                    style={{ width: `${volume}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={changeVolume}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <MdVolumeUp size={16} className="text-gray-500" />
              </div>
              <div className="flex">Playing on:</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
