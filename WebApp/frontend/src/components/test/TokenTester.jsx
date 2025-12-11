import { useEffect, useState } from "react";
import { getClientToken, searchTrack } from "../../utils/token";

const TokenTester = () => {
  const [token, setToken] = useState("Fetching...");
  const [error, setError] = useState(null);

  const [trackData, setTrackData] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

      const accessToken = await getClientToken(clientId, clientSecret);

      if (accessToken) {
        setToken(accessToken);
        const song = await searchTrack(accessToken, "MONTAGEM DIECAO Slow");
        setTrackData(song);
      } else {
        setToken("Failed to get token");
        setError("Check console for details");
      }
    };

    fetchToken();
  }, []);

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg max-w-lg mx-auto mt-10 shadow-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4 text-green-400">
        Playground: Token Test
      </h2>

      <div className="bg-black p-4 rounded text-sm font-mono break-all border border-gray-600">
        {error ? (
          <span className="text-red-500">{error}</span>
        ) : (
          <span className="text-gray-300">{token}</span>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        * This is a Client Credentials token (Read-only / No User Context).
      </p>

      {trackData && (
        <div className="mt-6 flex items-center bg-gray-700 p-4 rounded-lg border border-gray-600">
          <img
            src={trackData.album.images[0].url}
            alt="Album Art"
            className="w-16 h-16 rounded mr-4"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{trackData.name}</h3>
            <p className="text-gray-400">{trackData.artists[0].name}</p>
            <a
              href={trackData.external_urls.spotify}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-green-400 hover:underline"
            >
              Open in Spotify
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenTester;
