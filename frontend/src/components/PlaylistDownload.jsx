import { useState, useEffect } from 'react'
import './PlaylistDownload.css'

const QUALITIES = [
  { value: '360p', label: '360p' },
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
  { value: 'mp3', label: 'MP3' },
  { value: 'm4a', label: 'M4A' },
]

export default function PlaylistDownload({ sessionId, onJobsCreated }) {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [quality, setQuality] = useState('1080p')
  const [premiumKey, setPremiumKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [premiumEnabled, setPremiumEnabled] = useState(false)

  useEffect(() => {
    fetch('/api/premium/check')
      .then((r) => r.json())
      .then((d) => setPremiumEnabled(d.enabled))
      .catch(() => setPremiumEnabled(false))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!playlistUrl.trim()) {
      setError('Please enter a playlist URL.')
      return
    }
    if (!premiumKey.trim() && premiumEnabled) {
      setError('Premium key required. Enter your key or purchase access.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/playlist/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlist_url: playlistUrl.trim(),
          quality,
          session_id: sessionId,
          premium_key: premiumKey.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Playlist download failed')
      onJobsCreated?.(data.job_ids || [], { url: '(playlist)', quality })
      setPlaylistUrl('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  if (!premiumEnabled) {
    return (
      <section className="playlist-download card">
        <h2>Playlist Download (Premium)</h2>
        <p className="hint">Download entire playlists in one go. Set PREMIUM_KEYS in backend env to enable this feature.</p>
        <p className="coming-soon">Coming soon. Contact the developer to get access.</p>
      </section>
    )
  }

  return (
    <section className="playlist-download card">
      <h2>Playlist Download <span className="badge-premium">Premium</span></h2>
      <p className="hint">Paste a YouTube or other playlist URL to download all videos. Requires a premium key.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="https://www.youtube.com/playlist?list=..."
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          className="url-input"
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Premium key"
          value={premiumKey}
          onChange={(e) => setPremiumKey(e.target.value)}
          className="premium-key-input"
          disabled={loading}
        />
        <div className="quality-row">
          <label>Quality</label>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="quality-select" disabled={loading}>
            {QUALITIES.map((q) => <option key={q.value} value={q.value}>{q.label}</option>)}
          </select>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-amber" disabled={loading}>
          {loading ? 'Starting…' : 'Download playlist'}
        </button>
      </form>
    </section>
  )
}
