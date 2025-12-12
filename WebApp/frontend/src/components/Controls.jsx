import React from "react";
import {
  MdPlayCircleFilled,
  MdPauseCircleFilled,
  MdSkipNext,
  MdSkipPrevious,
  MdVolumeUp,
} from "react-icons/md";

const Controls = ({ playerState, onPlay, onPause, onNext, onPrev }) => {
  if (!playerState || !playerState.item)
    return <div className="h-24 bg-[#181818] border-t border-[#282828]" />;

  const { item, is_playing, progress_ms } = playerState;
  const duration_ms = item.duration_ms;
  const progressPercent = (progress_ms / duration_ms) * 100;

  // Helper to format 123000ms -> "2:03"
  const fmtTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  };

  return (
    <div className="h-24 bg-[#181818] border-t border-[#282828] px-6 flex items-center justify-between z-20 relative">
      {/* 1. LEFT: Mini Info */}
      <div className="w-1/3 flex items-center gap-4">
        <img
          src={item.album.images[0].url}
          className="w-14 h-14 rounded shadow-md"
          alt="Mini"
        />
        <div className="hidden md:block">
          <div className="text-sm font-bold text-white line-clamp-1">
            {item.name}
          </div>
          <div className="text-xs text-gray-400">{item.artists[0].name}</div>
        </div>
      </div>

      {/* 2. CENTER: Playback Controls */}
      <div className="w-1/3 flex flex-col items-center">
        {/* Buttons */}
        <div className="flex items-center gap-6 mb-2">
          <button
            onClick={onPrev}
            className="text-gray-400 hover:text-white transition"
          >
            <MdSkipPrevious size={28} />
          </button>

          <button
            onClick={is_playing ? onPause : onPlay}
            className="text-white hover:scale-110 transition"
          >
            {is_playing ? (
              <MdPauseCircleFilled size={44} />
            ) : (
              <MdPlayCircleFilled size={44} />
            )}
          </button>

          <button
            onClick={onNext}
            className="text-gray-400 hover:text-white transition"
          >
            <MdSkipNext size={28} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full flex items-center gap-2 text-xs text-gray-400 font-mono">
          <span>{fmtTime(progress_ms)}</span>
          <div className="h-1 flex-1 bg-[#404040] rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <span>{fmtTime(duration_ms)}</span>
        </div>
      </div>

      {/* 3. RIGHT: Volume (Visual Only for now) */}
      <div className="w-1/3 flex justify-end items-center gap-2 opacity-50 hover:opacity-100 transition">
        <MdVolumeUp size={20} />
        <div className="w-24 h-1 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500"
            style={{ width: `${playerState.device.volume_percent}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Controls;
