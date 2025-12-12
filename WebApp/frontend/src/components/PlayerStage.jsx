import React from "react";
import { MdDevices } from "react-icons/md";
import DeviceSelector from "./DeviceSelector";

const PlayerStage = ({ playerState }) => {
  // SCENARIO 1: IDLE / NO MUSIC
  if (!playerState || !playerState.item) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 z-10">
        <MdDevices size={64} className="mb-4 opacity-50" />
        <p className="text-xl">No Active Session</p>
        <p className="text-sm mt-2">Open Spotify on a device to begin.</p>
      </div>
    );
  }

  const { item, device } = playerState;
  const imageUrl = item.album.images[0]?.url;

  // SCENARIO 2: PLAYING
  return (
    <div className="flex-1 flex relative overflow-hidden">
      {/* A. DYNAMIC BACKGROUND BLUR */}
      <div
        className="absolute inset-0 z-0 bg-center bg-cover blur-3xl opacity-30 transition-all duration-1000 scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>

      {/* B. THE STAGE (Album Art & Info) */}
      <div className="z-10 w-full flex flex-col items-center justify-center p-10 animate-fade-in-up">
        <DeviceSelector activeDeviceId={device?.id} />

        {/* Album Art */}
        <img
          src={imageUrl}
          className="w-64 h-64 md:w-80 md:h-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded mb-8 transform hover:scale-105 transition-transform duration-500"
          alt="Album Art"
        />

        {/* Song Info */}
        <h1 className="text-3xl md:text-5xl font-bold mb-3 text-center max-w-4xl tracking-tight drop-shadow-2xl">
          {item.name}
        </h1>
        <h2 className="text-xl text-gray-300 mb-8 font-medium">
          {item.artists.map((a) => a.name).join(", ")}
        </h2>
      </div>
    </div>
  );
};

export default PlayerStage;
