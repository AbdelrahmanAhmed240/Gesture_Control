import React from "react";
import { MdMusicNote } from "react-icons/md"; // Ensure you installed react-icons

const Login = () => {
  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center text-white font-sans">
      {/* Logo Animation */}
      <div className="animate-pulse mb-8">
        <MdMusicNote size={80} className="text-green-500" />
      </div>

      {/* Title */}
      <h1 className="text-5xl font-bold tracking-tighter mb-4">Startify</h1>
      <p className="text-gray-400 mb-10 tracking-widest text-sm uppercase">
        IoT Hand & Voice Control System
      </p>

      {/* Login Button */}
      {/* Points directly to your Flask Backend */}
      <a
        href="http://127.0.0.1:5000/login"
        className="px-8 py-3 bg-green-500 text-black font-bold rounded-full hover:scale-105 transition-transform shadow-[0_0_20px_rgba(34,197,94,0.4)]"
      >
        LOGIN WITH SPOTIFY
      </a>
    </div>
  );
};

export default Login;
