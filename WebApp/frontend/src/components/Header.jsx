import React, { useEffect, useState } from "react";
import {
  MdPowerSettingsNew,
  MdSettings,
  MdCheck,
  MdErrorOutline,
} from "react-icons/md";
import { getEngineStatus, toggleModule } from "../utils/engine";

const Header = ({ user, systemActive, onToggleSystem }) => {
  const [showSettings, setShowSettings] = useState(false);

  const [engineState, setEngineState] = useState({
    voice_active: false,
    hand_active: false,
    voice_ready: false,
    hand_ready: false,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      const status = await getEngineStatus();
      console.log("From useEffect engineState:", engineState);
      console.log("From useEffect safeState:", safeState);
      if (status) setEngineState(status);
    };

    // Initial fetch
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleModuleToggle = async (module, isActive) => {
    setEngineState((prev) => ({ ...prev, [`${module}_active`]: isActive }));
    await toggleModule(module, isActive);

    console.log("From handleModuleToggle:", safeState);
  };

  // Safety Default
  const safeState = engineState || {
    voice_active: false,
    hand_active: false,
    voice_ready: false,
    hand_ready: false,
  };

  const isGlobalActive =
    systemActive || safeState.voice_active || safeState.hand_active;

  return (
    <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-[#282828] z-20 relative">
      {/* LEFT: BRANDING */}
      <div className="flex items-center gap-3">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            isGlobalActive ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="font-bold tracking-wider text-sm text-gray-400">
          STARTIFY CONTROLLER v1.4
        </span>
      </div>

      {/* RIGHT: USER & CONTROLS */}
      <div className="flex items-center gap-4">
        {/* User Info */}
        {user && (
          <div className="hidden md:flex items-center gap-3 border-r border-gray-800 pr-4">
            <span className="text-sm font-bold text-gray-300">
              {user.display_name}
            </span>
            {user.images?.[0] ? (
              <img
                src={user.images[0].url}
                className="w-8 h-8 rounded-full border border-[#282828]"
                alt="User"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700"></div>
            )}
          </div>
        )}

        {/* --- SETTINGS BUTTON --- */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-full transition-all cursor-pointer ${
              showSettings
                ? "bg-[#282828] text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <MdSettings size={24} />
          </button>

          {/* POPUP WINDOW */}
          {showSettings && (
            <div className="absolute right-0 top-12 w-72 bg-[#181818] border border-[#333] rounded-xl shadow-2xl p-5 z-50 animate-fade-in-up">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Engine Configuration
              </h3>

              {/* VOICE TOGGLE */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-300">
                    Voice Control
                  </span>
                  {/* Status Text */}
                  {!safeState.voice_ready ? (
                    <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <MdErrorOutline /> Engine Disconnected
                    </span>
                  ) : (
                    <span className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                      <MdCheck /> Engine Ready
                    </span>
                  )}
                </div>

                <button
                  disabled={!safeState.voice_ready}
                  onClick={() =>
                    handleModuleToggle("voice", !safeState.voice_active)
                  }
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                    safeState.voice_active ? "bg-green-500" : "bg-gray-700"
                  } ${
                    !safeState.voice_ready
                      ? "opacity-30 cursor-not-allowed grayscale"
                      : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      safeState.voice_active ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* HAND TOGGLE */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-300">
                    Hand Gestures
                  </span>
                  {!safeState.hand_ready ? (
                    <span className="text-[10px] text-red-500 flex items-center gap-1 mt-1">
                      <MdErrorOutline /> Engine Disconnected
                    </span>
                  ) : (
                    <span className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                      <MdCheck /> Engine Ready
                    </span>
                  )}
                </div>

                <button
                  disabled={!safeState.hand_ready}
                  onClick={() =>
                    handleModuleToggle("hand", !safeState.hand_active)
                  }
                  className={`w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300 ${
                    safeState.hand_active ? "bg-green-500" : "bg-gray-700"
                  } ${
                    !safeState.hand_ready
                      ? "opacity-30 cursor-not-allowed grayscale"
                      : "cursor-pointer"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      safeState.hand_active ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Health System Toggle */}
        <button
          onClick={onToggleSystem}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all cursor-pointer ${
            systemActive
              ? "bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.6)]"
              : "bg-red-900/50 text-red-200 border border-red-800 hover:border-red-500"
          }`}
        >
          <MdPowerSettingsNew size={20} />
          <span className="text-xs">
            {systemActive ? "SYSTEM HEALTH ACTIVE" : "SYSTEM HEALTH OFF"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
