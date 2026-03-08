import { useState, useEffect, useRef } from 'react'
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
  const [formats, setFormats] = useState([])
  const [formatId, setFormatId] = useState('best')
  const [usePreset, setUsePreset] = useState(true)
  const [preset, setPreset] = useState('1080p')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const lastFetchedUrl = useRef('')

  useEffect(() => {
    if (!playlistUrl.trim() || playlistUrl.trim() === lastFetchedUrl.current) return
    const t = setTimeout(() => {
      lastFetchedUrl.current = playlistUrl.trim()
      setFetchLoading(true)
      const params = new URLSearchParams({ url: playlistUrl.trim() })
      if (sessionId) params.append('session_id', sessionId)
      fetch(`/api/playlist/first-video?${params}`)
        .then((r) => r.json())
        .then((d) => {
          if (!d.url) throw new Error('No video in playlist')
          const fmtParams = new URLSearchParams({ url: d.url })
          if (sessionId) fmtParams.append('session_id', sessionId)
          return fetch(`/api/formats?${fmtParams}`)
        })
        .then((r) => r.json())
        .then((d) => {
          const list = d.formats || []
          setFormats(list)
          setFormatId(list[0]?.format_id || 'best')
          setUsePreset(list.length <= 2)
        })
        .catch(() => setFormats([]))
        .finally(() => setFetchLoading(false))
    }, 600)
    return () => clearTimeout(t)
  }, [playlistUrl, sessionId])

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
          quality: usePreset ? preset : '',
          format_id: usePreset ? null : formatId,
          session_id: sessionId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Playlist download failed')
      onJobsCreated?.(data.job_ids || [], { url: '(playlist)', quality: usePreset ? preset : formatId })
      setPlaylistUrl('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const recommended = formats.filter((f) => ['best', 'bestvideo+bestaudio', 'bestaudio'].includes(f.format_id))
  const videoFormats = formats.filter((f) => f.type === 'video')
  const audioFormats = formats.filter((f) => f.type === 'audio')
  const hasUrlFormats = formats.length > 0
  const showFormatList = hasUrlFormats && !usePreset

  return (
    <section className="playlist-download card">
      <h2>Playlist Download</h2>
      <p className="hint">Paste a playlist URL. Formats load from the first video — pick Video or Audio, then download all.</p>
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
        {playlistUrl.trim() && (
          <div className="field-group format-group">
            <span className="field-label">
              {usePreset ? 'Format (preset)' : 'Available formats'}
              {fetchLoading && <span className="format-loading"> … loading</span>}
            </span>
            <div className="format-tabs">
              <button
                type="button"
                className={`format-tab ${usePreset ? 'active' : ''}`}
                onClick={() => setUsePreset(true)}
                disabled={loading}
              >
                Preset
              </button>
              <button
                type="button"
                className={`format-tab ${!usePreset ? 'active' : ''}`}
                onClick={() => setUsePreset(false)}
                disabled={loading || !hasUrlFormats}
              >
                From URL
              </button>
            </div>
            {usePreset ? (
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="quality-select"
                disabled={loading}
              >
                {PRESETS.map((q) => (
                  <option key={q.value} value={q.value}>{q.label}</option>
                ))}
              </select>
            ) : (
              <div className="format-list" aria-label="Available formats">
                <div className="format-list-section">
                  <span className="format-list-heading">Recommended</span>
                  {recommended.map((f) => (
                    <button
                      key={f.format_id}
                      type="button"
                      className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                      onClick={() => setFormatId(f.format_id)}
                      disabled={loading}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="format-list-section">
                  <span className="format-list-heading">Video</span>
                  {videoFormats.length > 0 ? (
                    videoFormats.map((f) => (
                      <button
                        key={f.format_id}
                        type="button"
                        className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                        onClick={() => setFormatId(f.format_id)}
                        disabled={loading}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : (
                    <span className="format-list-empty">Upload cookies for more video formats</span>
                  )}
                </div>
                <div className="format-list-section">
                  <span className="format-list-heading">Audio</span>
                  {audioFormats.length > 0 ? (
                    audioFormats.map((f) => (
                      <button
                        key={f.format_id}
                        type="button"
                        className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                        onClick={() => setFormatId(f.format_id)}
                        disabled={loading}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : (
                    <span className="format-list-empty">Upload cookies for more audio formats</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-amber" disabled={loading || (playlistUrl.trim() && fetchLoading)}>
          {fetchLoading ? 'Loading formats…' : loading ? 'Starting…' : 'Download playlist'}
        </button>
      </form>
    </section>
  )
}
