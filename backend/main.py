"""
StreamSnag backend — video download API powered by yt-dlp.
"""
import json
import re
import shutil
import threading
import time
import uuid
from pathlib import Path
from typing import Optional

import yt_dlp
from fastapi import FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import httpx
from openai import OpenAI
from pydantic import BaseModel

from config import DOWNLOADS_DIR, COOKIES_DIR, FORMAT_MAP, OPENAI_API_KEY, CLEANUP_AGE_HOURS, PREMIUM_KEYS

app = FastAPI(title="StreamSnag API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory job status (use Redis/DB in production)
jobs: dict[str, dict] = {}
# Cookie file path per session (optional)
session_cookies: dict[str, Path] = {}

DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)
COOKIES_DIR.mkdir(parents=True, exist_ok=True)


def _cleanup_old_downloads():
    """Remove download dirs and job entries older than CLEANUP_AGE_HOURS."""
    age_sec = CLEANUP_AGE_HOURS * 3600
    cutoff = time.time() - age_sec
    for path in list(DOWNLOADS_DIR.iterdir()) if DOWNLOADS_DIR.exists() else []:
        if not path.is_dir():
            continue
        try:
            mtime = path.stat().st_mtime
            if mtime < cutoff:
                shutil.rmtree(path, ignore_errors=True)
                job_id = path.name
                jobs.pop(job_id, None)
        except OSError:
            pass


def _cleanup_loop():
    _cleanup_old_downloads()  # run immediately on start
    while True:
        time.sleep(30 * 60)  # then every 30 min
        _cleanup_old_downloads()


def _start_cleanup_thread():
    t = threading.Thread(target=_cleanup_loop, daemon=True)
    t.start()


class DownloadRequest(BaseModel):
    url: str
    quality: str  # 720p, 1080p, 2k, 4k, mp3
    session_id: Optional[str] = None


class AgentExtractRequest(BaseModel):
    page_url: str
    session_id: Optional[str] = None


class AgentBulkRequest(BaseModel):
    urls: list[str]
    quality: str
    session_id: Optional[str] = None


class PlaylistDownloadRequest(BaseModel):
    playlist_url: str
    quality: str
    session_id: Optional[str] = None
    premium_key: Optional[str] = None


def _suggest_format_alternative(requested: str, error: str) -> Optional[str]:
    """Suggest an alternative format when the requested one fails."""
    err_lower = error.lower()
    if "requested format" in err_lower or "format is not available" in err_lower or "no video formats" in err_lower:
        fallbacks = {"4k": "2k or 1080p", "2k": "1080p or 720p", "1080p": "720p or 480p", "720p": "480p or 360p",
                     "480p": "360p", "mp3": "Try m4a (audio) or 720p (video)", "m4a": "Try mp3 (audio)"}
        return fallbacks.get(requested, "Try a lower quality (e.g. 720p or 480p) or MP3 for audio.")
    if "403" in err_lower or "forbidden" in err_lower:
        return "YouTube may be blocking. Try uploading cookies (see Cookie Upload above) or try again later."
    if "sign in" in err_lower or "login" in err_lower:
        return "This video requires sign-in. Upload your YouTube cookies to download."
    return None


def run_ydl(url: str, out_dir: Path, quality: str, cookies_path: Optional[Path] = None, job_id: str = "", format_id: Optional[str] = None):
    fmt = format_id if format_id else FORMAT_MAP.get(quality, FORMAT_MAP["1080p"])
    opts = {
        "outtmpl": str(out_dir / "%(title).200s [%(id)s].%(ext)s"),
        "format": fmt,
        "quiet": False,
        "no_warnings": False,
        "extractor_args": {"youtube": {"player_client": ["android"]}},
    }
    if format_id:
        opts["merge_output_format"] = "mp4"
    elif quality in ("mp3", "m4a"):
        opts["postprocessors"] = [{"key": "FFmpegExtractAudio", "preferredcodec": "mp3" if quality == "mp3" else "m4a", "preferredquality": "0"}]
    else:
        opts["merge_output_format"] = "mp4"
    if cookies_path and cookies_path.exists():
        opts["cookiefile"] = str(cookies_path)

    def progress_hook(d):
        if job_id and d.get("status") == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            current = d.get("downloaded_bytes", 0)
            if total:
                pct = min(100, round(100 * current / total, 1))
                jobs[job_id]["progress"] = pct
                jobs[job_id]["status"] = "downloading"
        elif job_id and d.get("status") == "finished":
            jobs[job_id]["progress"] = 100
            jobs[job_id]["status"] = "processing"

    opts["progress_hooks"] = [progress_hook]

    with yt_dlp.YoutubeDL(opts) as ydl:
        try:
            info = ydl.extract_info(url, download=True)
            if job_id:
                jobs[job_id]["status"] = "completed"
                jobs[job_id]["info"] = {
                    "title": info.get("title"),
                    "id": info.get("id"),
                }
            return info
        except Exception as e:
            err_str = str(e)
            if job_id:
                jobs[job_id]["status"] = "error"
                jobs[job_id]["error"] = err_str
                suggestion = _suggest_format_alternative(quality, err_str)
                if suggestion:
                    jobs[job_id]["suggestion"] = suggestion
            raise


@app.get("/api/formats")
async def list_formats(
    url: str = Query(...),
    session_id: Optional[str] = Query(None),
):
    """List available formats for a video URL."""
    cookies_path = session_cookies.get(session_id) if session_id else None
    opts = {"quiet": True, "extractor_args": {"youtube": {"player_client": ["android"]}}}
    if cookies_path and cookies_path.exists():
        opts["cookiefile"] = str(cookies_path)
    with yt_dlp.YoutubeDL(opts) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except Exception as e:
            raise HTTPException(400, f"Could not fetch video info: {str(e)}")
    fmts = info.get("formats") or []
    out = [{"format_id": "best", "label": "Best (auto)", "resolution": "", "ext": ""}]
    seen = set()
    for f in sorted(fmts, key=lambda x: (x.get("height") or 0, x.get("quality") or 0), reverse=True):
        fid = f.get("format_id")
        if not fid or fid in seen:
            continue
        vcodec, acodec = f.get("vcodec") or "none", f.get("acodec") or "none"
        if vcodec == "none" and acodec == "none":
            continue
        seen.add(fid)
        h = f.get("height")
        res = f.get("resolution") or (f"{h}p" if h else "")
        ext = f.get("ext", "")
        desc = f.get("format_note") or ""
        label = " | ".join(x for x in [res, ext, desc, f"id:{fid}"] if x)
        out.append({"format_id": fid, "label": label, "resolution": res, "ext": ext})
    return {"formats": out, "title": info.get("title", "")}


@app.post("/api/download")
async def start_download(
    url: str = Form(...),
    quality: str = Form("1080p"),
    format_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
):
    if format_id:
        pass
    elif quality not in FORMAT_MAP:
        raise HTTPException(400, f"Invalid quality. Use one of: {list(FORMAT_MAP.keys())}")
    job_id = str(uuid.uuid4())
    out_dir = DOWNLOADS_DIR / job_id
    out_dir.mkdir(parents=True, exist_ok=True)
    cookies_path = session_cookies.get(session_id) if session_id else None

    jobs[job_id] = {"status": "started", "progress": 0, "url": url, "quality": quality or format_id}

    def task():
        try:
            run_ydl(url, out_dir, quality or "1080p", cookies_path, job_id, format_id=format_id or None)
        except Exception as e:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["error"] = str(e)

    threading.Thread(target=task, daemon=True).start()
    return {"job_id": job_id, "message": "Download started."}


@app.get("/api/jobs/{job_id}")
async def job_status(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    return jobs[job_id]


@app.get("/api/jobs/{job_id}/file")
async def get_file(job_id: str):
    if job_id not in jobs:
        raise HTTPException(404, "Job not found")
    if jobs[job_id]["status"] != "completed":
        raise HTTPException(400, "Download not completed yet")
    out_dir = DOWNLOADS_DIR / job_id
    files = list(out_dir.glob("*"))
    if not files:
        raise HTTPException(404, "File not found")
    return FileResponse(files[0], filename=files[0].name)


@app.post("/api/cookies")
async def upload_cookies(
    session_id: str = Form(...),
    file: UploadFile = File(...),
):
    if not file.filename or not file.filename.lower().endswith((".txt", ".cookies")):
        raise HTTPException(400, "Please upload a cookies file (.txt or .cookies)")
    path = COOKIES_DIR / f"{session_id}.txt"
    content = await file.read()
    path.write_bytes(content)
    session_cookies[session_id] = path
    return {"message": "Cookies uploaded. They will be used for subsequent downloads in this session."}


@app.post("/api/agent/extract")
async def agent_extract(body: AgentExtractRequest):
    """Fetch page at page_url and use OpenAI to extract video/embed links."""
    if not OPENAI_API_KEY:
        raise HTTPException(503, "OpenAI API key not configured. Set OPENAI_API_KEY in .env")
    try:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            r = await client.get(body.page_url, timeout=15.0)
            r.raise_for_status()
            html = r.text
    except Exception as e:
        raise HTTPException(400, f"Could not fetch URL: {str(e)}")

    # Heuristic: also collect obvious video URLs from HTML
    patterns = [
        r'https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+',
        r'https?://youtu\.be/[\w-]+',
        r'https?://(?:www\.)?(?:vimeo|dailymotion|twitch|twitter|x\.com)[^\s"\'<>]+',
        r'https?://[^\s"\'<>]*\.(?:mp4|webm|m3u8)[^\s"\'<>]*',
        r'"(https?://[^"]*youtube[^"]*)"',
        r'"(https?://[^"]*vimeo[^"]*)"',
    ]
    found_links = set()
    for p in patterns:
        for m in re.finditer(p, html, re.I):
            u = m.group(1) if m.lastindex else m.group(0)
            u = u.split("?")[0].rstrip("'\")")
            if u.startswith("http"):
                found_links.add(u)

    # If we have clear video links, return them
    if found_links:
        return {"links": list(found_links), "source": "heuristic"}

    # Otherwise use OpenAI to find links in the page content
    client = OpenAI(api_key=OPENAI_API_KEY)
    # Truncate HTML to avoid token limit
    text_sample = html[:12000] if len(html) > 12000 else html
    prompt = """From this HTML or web page content, extract ALL URLs that point to videos (YouTube, Vimeo, Dailymotion, Twitter/X, Twitch, or direct video files like .mp4, .webm, .m3u8). Return ONLY a JSON array of strings, each string being one full URL. If there are no video URLs, return []. No other text.

Content:
"""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt + text_sample}],
            temperature=0,
        )
        raw = resp.choices[0].message.content.strip()
        # Handle markdown code block
        if raw.startswith("```"):
            raw = re.sub(r"^```\w*\n?", "", raw).replace("```", "")
        arr = json.loads(raw)
        if isinstance(arr, list):
            return {"links": [u for u in arr if isinstance(u, str) and u.startswith("http")], "source": "openai"}
    except Exception as e:
        pass  # fallback to heuristic

    return {"links": list(found_links), "source": "heuristic"}


@app.post("/api/playlist/download")
async def playlist_download(body: PlaylistDownloadRequest):
    """Download whole playlist — Premium feature. Requires valid premium_key."""
    if not PREMIUM_KEYS:
        raise HTTPException(503, "Premium playlist download is not configured. Set PREMIUM_KEYS in env.")
    if not body.premium_key or body.premium_key.strip() not in PREMIUM_KEYS:
        raise HTTPException(403, "Valid premium key required. Purchase access to use playlist download.")
    if body.quality not in FORMAT_MAP:
        raise HTTPException(400, f"Invalid quality. Use one of: {list(FORMAT_MAP.keys())}")
    # Use yt-dlp's built-in playlist support: pass playlist URL directly
    job_ids = []
    cookies_path = session_cookies.get(body.session_id) if body.session_id else None
    # Extract playlist entries and start one job per video (yt-dlp can do this via extract_flat + iter)
    ext_opts = {"quiet": True, "extract_flat": "in_playlist"}
    if cookies_path and cookies_path.exists():
        ext_opts["cookiefile"] = str(cookies_path)
    with yt_dlp.YoutubeDL(ext_opts) as ydl:
        try:
            info = ydl.extract_info(body.playlist_url, download=False)
        except Exception as e:
            raise HTTPException(400, f"Could not read playlist: {str(e)}")
    entries = info.get("entries") or []
    if not entries:
        raise HTTPException(400, "No videos found in playlist.")
    for entry in entries[:50]:  # cap at 50
        vid_url = entry.get("url")
        if not vid_url and entry.get("id"):
            vid_url = f"https://www.youtube.com/watch?v={entry['id']}"
        if not vid_url or not vid_url.startswith("http"):
            continue
        job_id = str(uuid.uuid4())
        out_dir = DOWNLOADS_DIR / job_id
        out_dir.mkdir(parents=True, exist_ok=True)
        jobs[job_id] = {"status": "started", "progress": 0, "url": vid_url, "quality": body.quality}
        job_ids.append(job_id)
        def task(u=vid_url, od=out_dir, q=body.quality, cp=cookies_path, jid=job_id):
            try:
                run_ydl(u, od, q, cp, jid)
            except Exception:
                jobs[jid]["status"] = "error"
                jobs[jid]["error"] = "Download failed"
        threading.Thread(target=task, daemon=True).start()
    return {"job_ids": job_ids, "message": f"Started {len(job_ids)} download(s) from playlist."}


@app.get("/api/premium/check")
async def check_premium_enabled():
    """Returns whether premium (playlist) is available and requires a key."""
    return {"enabled": bool(PREMIUM_KEYS)}


@app.post("/api/agent/bulk")
async def agent_bulk(body: AgentBulkRequest):
    """Start multiple downloads (e.g. from extracted links or playlist)."""
    job_ids = []
    cookies_path = session_cookies.get(body.session_id) if body.session_id else None
    for url in body.urls[:50]:  # cap at 50
        job_id = str(uuid.uuid4())
        out_dir = DOWNLOADS_DIR / job_id
        out_dir.mkdir(parents=True, exist_ok=True)
        jobs[job_id] = {"status": "started", "progress": 0, "url": url, "quality": body.quality}
        job_ids.append(job_id)

        def task(u=url, od=out_dir, q=body.quality, cp=cookies_path, jid=job_id):
            try:
                run_ydl(u, od, q, cp, jid)
            except Exception as e:
                jobs[jid]["status"] = "error"
                jobs[jid]["error"] = str(e)

        threading.Thread(target=task, daemon=True).start()
    return {"job_ids": job_ids, "message": f"Started {len(job_ids)} download(s)."}


# Serve frontend in production (build output)
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/", StaticFiles(directory=str(frontend_dist), html=True), name="frontend")


@app.on_event("startup")
def on_startup():
    _start_cleanup_thread()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
