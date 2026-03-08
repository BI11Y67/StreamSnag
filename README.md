# StreamSnag — Video Downloader

A web UI to download videos from the internet using **yt-dlp** on the backend. Supports 720p, 1080p, 2K, 4K, and MP3. Includes an **AI Link Finder** (OpenAI) to extract video URLs from any webpage, plus cookie upload for bulk/age-restricted downloads.

## Features

- **Quick Download**: Paste a video or playlist URL, choose quality (720p / 1080p / 2K / 4K / MP3), and download.
- **Playlist support**: Paste a YouTube (or other) playlist URL to download the whole playlist.
- **Multiple links**: Paste several URLs (one per line) and download all at once.
- **AI Link Finder**: Paste a link to an article or page; the app finds embedded video URLs (YouTube, Vimeo, etc.) so you can download them even when you can't copy the video link.
- **Bulk download**: After finding links (or pasting multiple URLs), download all in one go.
- **Cookie upload**: Upload a cookies file when a site (e.g. YouTube) requires login for bulk or age-restricted content.
- **Download queue**: See progress and save completed files from the queue.
- **Donate & GitHub**: Footer links for support and your profile (see [Configuration](#configuration)).

## Requirements

- **Python 3.10+**
- **Node.js 18+** (for frontend build)
- **ffmpeg** on PATH (for merging video+audio and MP3)
- **OpenAI API key** (optional; only needed for AI Link Finder)

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set your OpenAI key (optional):

```bash
copy .env.example .env
# Edit .env: OPENAI_API_KEY=sk-your-key
```

Start the API:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server proxies `/api` to the backend.

### 3. Production (single server)

Build the frontend and serve it from the backend:

```bash
cd frontend && npm run build && cd ..
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000
```

Then open **http://localhost:8000**. The backend serves the built UI and API from the same origin.

## Configuration

- **Donate / GitHub links**: Edit `frontend/src/components/Footer.jsx` and set `GITHUB_URL` and `DONATE_URL` to your profile and donate page (e.g. GitHub Sponsors, Ko-fi, Buy Me a Coffee).
- **CLEANUP_AGE_HOURS** (backend): How long to keep downloaded files before cleanup (default: 2). Set via `.env` or environment variables.

## Deployment

StreamSnag can be deployed with Docker. The included `Dockerfile` builds the frontend, installs ffmpeg and Python deps, and serves both the API and UI from a single container.

### Docker (local)

```bash
docker build -t streamsnag .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-your-key streamsnag
```

Open **http://localhost:8000**.

### Railway

1. Push the repo to GitHub.
2. Go to [Railway](https://railway.app), create a project, and connect the repo.
3. Railway auto-detects the `Dockerfile` (or use `railway.json`).
4. Set `OPENAI_API_KEY` in the Variables tab.
5. Deploy. Railway assigns a public URL.

### Render

1. Push the repo to GitHub.
2. Go to [Render](https://render.com), New > Web Service, connect the repo.
3. Set runtime to **Docker** (uses root `Dockerfile`).
4. Set `OPENAI_API_KEY` in Environment.
5. Deploy. Render assigns a public URL.

`render.yaml` in the repo provides a Blueprint config for infrastructure-as-code.

### Fly.io / VPS

Use `fly launch` (Fly.io) or run `docker run` on any VPS. Ensure the container listens on the platform's `PORT` (the Dockerfile uses `$PORT` with fallback 8000).

**Note:** Public video-download services may violate some platforms' ToS. Deploy at your own risk; some hosts may restrict such apps.

## Cookies for YouTube / restricted content

1. Use a browser extension (e.g. "Get cookies.txt") to export cookies for youtube.com.
2. In the app, open **Upload cookies** and upload the `.txt` file.
3. Start your bulk or age-restricted download; the backend will use the cookie file for that session.

## Disclaimer

This tool is for personal use. Respect copyright and each platform’s terms of service. The authors are not responsible for misuse.

## License

MIT.
