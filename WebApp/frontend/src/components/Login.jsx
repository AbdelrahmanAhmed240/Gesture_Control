// src/components/Login.jsx
import React from "react";
import { LOGIN_URL } from "../spotify";

function Login() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-8">
      <h1 className="text-6xl font-bold tracking-tighter text-green-500">
        Startify
      </h1>
      <a
        href={LOGIN_URL}
        className="px-8 py-4 bg-green-500 rounded-full font-bold text-black hover:bg-green-400 hover:scale-105 transition duration-200"
      >
        LOGIN WITH SPOTIFY
      </a>

      <p className="text-gray-500 text-sm mt-4">Powered by Flask & React</p>
    </div>
  );
}

export default Login;
