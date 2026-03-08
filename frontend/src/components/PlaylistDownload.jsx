import { useState } from 'react'
import './PlaylistDownload.css'

const PRESETS = [
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
  const [preset, setPreset] = useState('1080p')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!playlistUrl.trim()) {
      setError('Please enter a playlist URL.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/playlist/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlist_url: playlistUrl.trim(),
          quality: preset,
          format_id: null,
          session_id: sessionId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Playlist download failed')
      onJobsCreated?.(data.job_ids || [], { url: '(playlist)', quality: preset })
      setPlaylistUrl('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="playlist-download card">
      <h2>Playlist Download</h2>
      <p className="hint">Paste a playlist URL. Pick a quality preset, then download all.</p>
      <form onSubmit={handleSubmit} className="download-form">
        <div className="field-group">
          <label className="field-label">Playlist URL</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            className="url-input"
            disabled={loading}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Download as</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="quality-select"
            disabled={loading}
          >
            <optgroup label="Video">
              {PRESETS.filter((q) => !['mp3', 'm4a'].includes(q.value)).map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </optgroup>
            <optgroup label="Audio">
              <option value="mp3">MP3</option>
              <option value="m4a">M4A</option>
            </optgroup>
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
