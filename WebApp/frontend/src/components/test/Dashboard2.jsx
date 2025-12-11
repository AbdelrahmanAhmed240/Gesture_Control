import React, { useEffect, useState } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import {
  MdPlayArrow,
  MdPause,
  MdSkipNext,
  MdSkipPrevious,
  MdShuffle,
  MdRepeat,
  MdVolumeDown,
  MdVolumeUp,
  MdClose,
  MdMusicNote,
  MdFavorite,
  MdFavoriteBorder,
  MdQueueMusic,
  MdHistory,
  MdTrendingUp,
  MdAlbum,
  MdPerson,
  MdLibraryMusic,
  MdRadio,
  MdDevices,
  MdLyrics,
  MdShare,
  MdMoreVert,
  MdPlaylistPlay,
  MdAccessTime,
} from "react-icons/md";

const spotify = new SpotifyWebApi();

function Dashboard({ token }) {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("player");

  // Player State
  const [nowPlaying, setNowPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [devices, setDevices] = useState([]);
  const [isLiked, setIsLiked] = useState(false);

  // Dashboard Data
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [queue, setQueue] = useState([]);
  const [audioFeatures, setAudioFeatures] = useState(null);
  const [timeRange, setTimeRange] = useState("short_term");

  useEffect(() => {
    spotify.setAccessToken(token);
    loadAllData();

    const interval = setInterval(fetchPlaybackState, 1000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    loadTopData();
  }, [timeRange]);

  const loadAllData = async () => {
    try {
      const [
        userData,
        topTracksData,
        topArtistsData,
        recentData,
        playlistsData,
      ] = await Promise.all([
        spotify.getMe(),
        spotify.getMyTopTracks({ limit: 20, time_range: timeRange }),
        spotify.getMyTopArtists({ limit: 20, time_range: timeRange }),
        spotify.getMyRecentlyPlayedTracks({ limit: 20 }),
        spotify.getUserPlaylists({ limit: 20 }),
      ]);

      setUser(userData);
      setTopTracks(topTracksData.items);
      setTopArtists(topArtistsData.items);
      setRecentTracks(recentData.items);
      setPlaylists(playlistsData.items);

      const stats = {
        totalFollowers: userData.followers?.total || 0,
        totalPlaylists: playlistsData.total,
      };
      setUserStats(stats);

      fetchPlaybackState();
      fetchDevices();
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadTopData = async () => {
    try {
      const [topTracksData, topArtistsData] = await Promise.all([
        spotify.getMyTopTracks({ limit: 20, time_range: timeRange }),
        spotify.getMyTopArtists({ limit: 20, time_range: timeRange }),
      ]);
      setTopTracks(topTracksData.items);
      setTopArtists(topArtistsData.items);
    } catch (error) {
      console.error("Error loading top data:", error);
    }
  };

  const fetchPlaybackState = async () => {
    try {
      const data = await spotify.getMyCurrentPlaybackState();
      if (data && data.item) {
        setNowPlaying(data.item);
        setIsPlaying(data.is_playing);
        setShuffle(data.shuffle_state);
        setProgress(data.progress_ms);
        setDuration(data.item.duration_ms);
        setRepeatMode(
          data.repeat_state === "off"
            ? 0
            : data.repeat_state === "context"
            ? 1
            : 2
        );
        if (data.device?.volume_percent !== null)
          setVolume(data.device.volume_percent);

        // Check if track is liked
        const [liked] = await spotify.containsMySavedTracks([data.item.id]);
        setIsLiked(liked);

        // Get audio features
        const features = await spotify.getAudioFeaturesForTrack(data.item.id);
        setAudioFeatures(features);

        // Get recommendations based on current track
        const recs = await spotify.getRecommendations({
          seed_tracks: [data.item.id],
          limit: 10,
        });
        setRecommendations(recs.tracks);
      }
    } catch (error) {
      console.error("Error fetching playback:", error);
    }
  };

  const fetchDevices = async () => {
    try {
      const data = await spotify.getMyDevices();
      setDevices(data.devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  };

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

  const toggleLike = async () => {
    if (nowPlaying) {
      if (isLiked) {
        await spotify.removeFromMySavedTracks([nowPlaying.id]);
      } else {
        await spotify.addToMySavedTracks([nowPlaying.id]);
      }
      setIsLiked(!isLiked);
    }
  };

  const playTrack = (uri) => {
    spotify.play({ uris: [uri] }).then(fetchPlaybackState);
  };

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const bgImage = nowPlaying?.album.images[0]?.url || "";

  const PlayerView = () => (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Now Playing Card */}
      <div className="bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Album Art */}
          <div className="relative group">
            <div className="absolute inset-0 bg-green-500 blur-2xl opacity-30 group-hover:opacity-50 transition duration-700" />
            <img
              src={
                nowPlaying?.album.images[0]?.url ||
                "https://via.placeholder.com/300"
              }
              alt="Album Art"
              className={`relative w-72 h-72 object-cover rounded-2xl shadow-2xl transition-all duration-700 ${
                isPlaying ? "scale-100" : "scale-95 grayscale-[0.3]"
              }`}
            />
          </div>

          {/* Track Info & Controls */}
          <div className="flex-1 w-full space-y-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">
                {nowPlaying?.name || "No track playing"}
              </h2>
              <p className="text-xl text-gray-400">
                {nowPlaying?.artists.map((a) => a.name).join(", ") ||
                  "Spotify is idle"}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {nowPlaying?.album.name}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
                <div
                  className="absolute h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${(progress / duration) * 100}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => {
                    const newProgress = parseInt(e.target.value);
                    setProgress(newProgress);
                    spotify.seek(newProgress);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleShuffle}
                  className={`${
                    shuffle ? "text-green-500" : "text-gray-500"
                  } hover:text-white transition`}
                >
                  <MdShuffle size={24} />
                </button>
                <button
                  onClick={skipPrev}
                  className="text-white hover:text-green-400 transition"
                >
                  <MdSkipPrevious size={44} />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-lg hover:scale-110 hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
                >
                  {isPlaying ? (
                    <MdPause size={36} />
                  ) : (
                    <MdPlayArrow size={36} className="ml-1" />
                  )}
                </button>
                <button
                  onClick={skipNext}
                  className="text-white hover:text-green-400 transition"
                >
                  <MdSkipNext size={44} />
                </button>
                <button
                  onClick={cycleRepeat}
                  className={`${
                    repeatMode > 0 ? "text-green-500" : "text-gray-500"
                  } hover:text-white transition`}
                >
                  <MdRepeat size={24} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleLike}
                  className={`${
                    isLiked ? "text-green-500" : "text-gray-500"
                  } hover:text-green-400 transition`}
                >
                  {isLiked ? (
                    <MdFavorite size={28} />
                  ) : (
                    <MdFavoriteBorder size={28} />
                  )}
                </button>
                <button className="text-gray-500 hover:text-white transition">
                  <MdShare size={24} />
                </button>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-3">
              <MdVolumeDown size={20} className="text-gray-500" />
              <div className="flex-1 relative h-2 bg-white/10 rounded-full">
                <div
                  className="absolute h-full bg-white rounded-full"
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
              <MdVolumeUp size={20} className="text-gray-500" />
              <span className="text-sm text-gray-500 w-12">{volume}%</span>
            </div>

            {/* Audio Features */}
            {audioFeatures && (
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    {Math.round(audioFeatures.energy * 100)}
                  </p>
                  <p className="text-xs text-gray-500">Energy</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">
                    {Math.round(audioFeatures.danceability * 100)}
                  </p>
                  <p className="text-xs text-gray-500">Dance</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.round(audioFeatures.valence * 100)}
                  </p>
                  <p className="text-xs text-gray-500">Mood</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {Math.round(audioFeatures.tempo)}
                  </p>
                  <p className="text-xs text-gray-500">BPM</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Devices & Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Devices */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MdDevices className="text-green-400" size={24} />
            <h3 className="text-xl font-bold">Available Devices</h3>
          </div>
          <div className="space-y-2">
            {devices.map((device) => (
              <div
                key={device.id}
                className={`p-3 rounded-lg ${
                  device.is_active
                    ? "bg-green-500/20 border border-green-500/30"
                    : "bg-white/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-xs text-gray-500">{device.type}</p>
                  </div>
                  {device.is_active && (
                    <span className="text-xs text-green-400 font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MdRadio className="text-green-400" size={24} />
            <h3 className="text-xl font-bold">Recommended</h3>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {recommendations.slice(0, 5).map((track) => (
              <div
                key={track.id}
                onClick={() => playTrack(track.uri)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition"
              >
                <img
                  src={track.album.images[2]?.url}
                  className="w-12 h-12 rounded"
                  alt={track.name}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{track.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {track.artists.map((a) => a.name).join(", ")}
                  </p>
                </div>
                <MdPlayArrow className="text-gray-500" size={20} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const TopTracksView = () => (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MdTrendingUp className="text-green-400" size={32} />
            <h2 className="text-3xl font-bold">Your Top Tracks</h2>
          </div>
          <div className="flex gap-2">
            {["short_term", "medium_term", "long_term"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  timeRange === range
                    ? "bg-green-500 text-black"
                    : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {range === "short_term"
                  ? "4 Weeks"
                  : range === "medium_term"
                  ? "6 Months"
                  : "All Time"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3">
          {topTracks.map((track, index) => (
            <div
              key={track.id}
              onClick={() => playTrack(track.uri)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition group"
            >
              <span className="text-2xl font-bold text-gray-600 w-8">
                {index + 1}
              </span>
              <img
                src={track.album.images[2]?.url}
                className="w-16 h-16 rounded-lg shadow-lg"
                alt={track.name}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg truncate">{track.name}</p>
                <p className="text-gray-400 truncate">
                  {track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
              <div className="text-sm text-gray-500">
                {formatDuration(track.duration_ms)}
              </div>
              <MdPlayArrow
                className="text-gray-500 group-hover:text-green-400 transition"
                size={28}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TopArtistsView = () => (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <MdPerson className="text-green-400" size={32} />
            <h2 className="text-3xl font-bold">Your Top Artists</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topArtists.map((artist, index) => (
            <div key={artist.id} className="group cursor-pointer">
              <div className="relative mb-3">
                <img
                  src={artist.images[0]?.url}
                  className="w-full aspect-square object-cover rounded-full shadow-xl group-hover:shadow-2xl transition-all"
                  alt={artist.name}
                />
                <div className="absolute top-2 left-2 w-8 h-8 bg-black/80 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-green-400">
                    {index + 1}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-center truncate">{artist.name}</h3>
              <p className="text-sm text-gray-500 text-center capitalize">
                {artist.genres[0] || "Artist"}
              </p>
              <p className="text-xs text-gray-600 text-center mt-1">
                {artist.followers.total.toLocaleString()} followers
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RecentTracksView = () => (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdHistory className="text-green-400" size={32} />
          <h2 className="text-3xl font-bold">Recently Played</h2>
        </div>
        <div className="grid gap-3">
          {recentTracks.map((item, index) => (
            <div
              key={index}
              onClick={() => playTrack(item.track.uri)}
              className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 cursor-pointer transition"
            >
              <img
                src={item.track.album.images[2]?.url}
                className="w-16 h-16 rounded-lg"
                alt={item.track.name}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{item.track.name}</p>
                <p className="text-sm text-gray-400 truncate">
                  {item.track.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                {new Date(item.played_at).toLocaleTimeString()}
              </div>
              <MdPlayArrow className="text-gray-500" size={24} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const PlaylistsView = () => (
    <div className="w-full max-w-7xl mx-auto p-6">
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <MdLibraryMusic className="text-green-400" size={32} />
          <h2 className="text-3xl font-bold">Your Playlists</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <div key={playlist.id} className="group cursor-pointer">
              <div className="relative mb-3 overflow-hidden rounded-lg">
                <img
                  src={
                    playlist.images[0]?.url || "https://via.placeholder.com/300"
                  }
                  className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-300"
                  alt={playlist.name}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <MdPlayArrow
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    size={48}
                  />
                </div>
              </div>
              <h3 className="font-bold truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-500">
                {playlist.tracks.total} tracks
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center transition-all duration-1000 opacity-20 blur-3xl scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-black via-neutral-900 to-black" />

      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 z-20 p-6">
        <div className="flex items-center gap-3 mb-8">
          {user?.images?.[0] ? (
            <img
              src={user.images[0].url}
              className="w-12 h-12 rounded-full border-2 border-green-500"
              alt="Profile"
            />
          ) : (
            <div className="w-12 h-12 bg-neutral-700 rounded-full" />
          )}
          <div>
            <p className="text-xs text-green-400 font-bold">CONNECTED</p>
            <h2 className="font-bold">{user?.display_name}</h2>
          </div>
        </div>

        <nav className="space-y-2">
          {[
            { id: "player", icon: MdMusicNote, label: "Now Playing" },
            { id: "tracks", icon: MdTrendingUp, label: "Top Tracks" },
            { id: "artists", icon: MdPerson, label: "Top Artists" },
            { id: "recent", icon: MdHistory, label: "Recent" },
            { id: "playlists", icon: MdLibraryMusic, label: "Playlists" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                activeView === item.id
                  ? "bg-green-500 text-black font-bold"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        {userStats && (
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-xs text-gray-500 mb-2">Your Stats</p>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-green-400 font-bold">
                  {userStats.totalPlaylists}
                </span>{" "}
                Playlists
              </p>
              <p className="text-sm">
                <span className="text-green-400 font-bold">
                  {userStats.totalFollowers}
                </span>{" "}
                Followers
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative z-10 ml-64 min-h-screen">
        {activeView === "player" && <PlayerView />}
        {activeView === "tracks" && <TopTracksView />}
        {activeView === "artists" && <TopArtistsView />}
        {activeView === "recent" && <RecentTracksView />}
        {activeView === "playlists" && <PlaylistsView />}
      </div>
    </div>
  );
}

export default Dashboard;
