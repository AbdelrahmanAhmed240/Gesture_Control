import React, { useState } from "react";
import { MdErrorOutline, MdRefresh, MdCode } from "react-icons/md";

const ErrorPage = ({ error, onDismiss }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!error) return null;

  return (
    <div className="fixed inset-0 z-[999] bg-[#121212] flex flex-col items-center justify-center text-white font-sans p-6 animate-fade-in">
      {/* 1. Pulse Icon */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse rounded-full"></div>
        <MdErrorOutline size={90} className="text-red-500 relative z-10" />
      </div>

      {/* 2. Error Code */}
      <h1 className="text-7xl font-bold tracking-tighter text-gray-700 mb-2 select-none">
        {error.code}
      </h1>

      {/* 3. User Message */}
      <h2 className="text-2xl font-bold text-red-500 tracking-wider uppercase mb-8 text-center max-w-2xl">
        {error.message || "Unknown System Error"}
      </h2>

      {/* 4. Action Buttons Container */}
      <div className="flex gap-4 mb-8">
        {/* A. Dismiss/Reboot Button */}
        <button
          onClick={onDismiss}
          className="flex items-center gap-2 px-6 py-3 bg-[#282828] border border-red-900/30 rounded-full hover:bg-red-900/20 hover:border-red-500 text-gray-300 transition-all cursor-pointer group"
        >
          <MdRefresh
            size={24}
            className="group-hover:-rotate-180 transition-transform duration-500"
          />
          <span className="font-bold text-sm">DISMISS / REBOOT</span>
        </button>
        {/* B. Toggle Details Button (Only if dev_info exists) */}
        {error.dev_info && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 px-4 py-3 bg-black border border-gray-800 rounded-full hover:border-gray-500 text-gray-500 hover:text-white transition-all cursor-pointer"
          >
            <MdCode size={20} />
            <span className="font-bold text-xs">
              {showDetails ? "HIDE DEBUG" : "SHOW DEBUG"}
            </span>
          </button>
        )}
      </div>

      {/* 5. Developer Info Panel (Collapsible) */}
      {showDetails && error.dev_info && (
        <div className="w-full max-w-2xl bg-black border border-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto shadow-inner">
          <p className="opacity-50 mb-2 border-b border-gray-800 pb-1">
            server_log_trace:
          </p>
          <pre className="whitespace-pre-wrap break-words">
            {error.dev_info}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ErrorPage;
