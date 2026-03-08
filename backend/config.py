import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
PREMIUM_KEYS = set(k.strip() for k in os.getenv("PREMIUM_KEYS", "").split(",") if k.strip())
DOWNLOADS_DIR = Path(os.getenv("DOWNLOADS_DIR", "downloads"))
COOKIES_DIR = Path(os.getenv("COOKIES_DIR", "cookies"))
CLEANUP_AGE_HOURS = float(os.getenv("CLEANUP_AGE_HOURS", "2"))

DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
COOKIES_DIR.mkdir(parents=True, exist_ok=True)

# yt-dlp format strings per quality (no "best" fallback for video - use explicit heights)
FORMAT_MAP = {
    "360p": "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]",
    "480p": "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]",
    "720p": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]",
    "1080p": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]",
    "2k": "bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440]",
    "4k": "bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]",
    "mp3": "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio",
    "m4a": "bestaudio[ext=m4a]/bestaudio",
}
