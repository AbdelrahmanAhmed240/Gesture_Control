import React from "react";
import { MdPowerSettingsNew } from "react-icons/md";

const Header = ({ user, systemActive, onToggleSystem }) => {
  return (
    <div className="h-16 bg-black flex items-center justify-between px-6 border-b border-[#282828] z-20">
      {/* LEFT: BRANDING */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span className="font-bold tracking-wider text-sm text-gray-400">
          STARTIFY CONTROLLER v1.1
        </span>
      </div>

      {/* RIGHT: USER & CONTROLS */}
      <div className="flex items-center gap-4">
        {/* User Info (Only show if loaded) */}
        {user && (
          <>
            <span className="text-sm font-bold text-gray-300 hidden md:block">
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
          </>
        )}

        {/* System Toggle Button */}
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
            {systemActive ? "SYSTEM ACTIVE" : "SYSTEM OFF"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
