import React, { useState, useEffect } from "react";
import { MdSmartphone, MdLaptopMac, MdSpeaker } from "react-icons/md";
import { fetchDevices } from "../utils/player";

const DeviceSelector = ({ activeDeviceId }) => {
  const [devices, setDevices] = useState([]);

  // Fetch devices when component mounts
  useEffect(() => {
    const load = async () => {
      const list = await fetchDevices();
      setDevices(list);
    };
    load();
    // Optional: Poll for devices every 5s if you want real-time updates
  }, []);

  const handleTransfer = async (id) => {
    // Optimistic UI update (optional) or just wait for next poll
    await transferDevice(id);
    // We assume the Dashboard polling will eventually update the Active ID
  };

  if (devices.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-in">
      {devices.map((d) => (
        <button
          key={d.id}
          onClick={() => handleTransfer(d.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border cursor-pointer mt-5 ${
            d.id === activeDeviceId
              ? "bg-green-500 text-black border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
              : "bg-[#282828] text-gray-400 border-transparent hover:border-gray-500 hover:text-white"
          }`}
        >
          {/* Icon Selection based on Device Type */}
          {d.type.toLowerCase() === "smartphone" ? (
            <MdSmartphone size={16} />
          ) : d.type.toLowerCase() === "computer" ? (
            <MdLaptopMac size={16} />
          ) : (
            <MdSpeaker size={16} />
          )}

          {d.name}
        </button>
      ))}
    </div>
  );
};

export default DeviceSelector;
