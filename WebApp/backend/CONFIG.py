from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
    SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

    # Spotify sends back to this URI after auth...
    REDIRECT_URI = 'http://127.0.0.1:5000/callback'
    FRONTEND_URI = 'http://localhost:5173'

    # Spotify endpoints...
    AUTH_URL = 'https://accounts.spotify.com/authorize'
    TOKEN_URL = 'https://accounts.spotify.com/api/token'
    API_BASE_URL = 'https://api.spotify.com/v1'

    SCOPES = ['user-read-playback-state', 'user-modify-playback-state', 'user-read-currently-playing', 'user-read-email', 'user-read-private']

    ERRORS = {
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        500: "Internal Server Error",
        501: "Not Implemented"
    }