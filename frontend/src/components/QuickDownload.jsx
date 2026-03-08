import { useState, useEffect, useRef } from 'react'
import './QuickDownload.css'

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

export default function QuickDownload({ sessionId, onJobCreated, onJobsCreated }) {
  const [url, setUrl] = useState('')
  const [formats, setFormats] = useState([])
  const [formatId, setFormatId] = useState('best')
  const [usePreset, setUsePreset] = useState(true)
  const [preset, setPreset] = useState('1080p')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [multiUrls, setMultiUrls] = useState('')
  const [multiLoading, setMultiLoading] = useState(false)
  const [multiError, setMultiError] = useState('')
  const lastFetchedUrl = useRef('')

  useEffect(() => {
    if (!url.trim() || url.trim() === lastFetchedUrl.current) return
    const t = setTimeout(() => {
      lastFetchedUrl.current = url.trim()
      setFetchLoading(true)
      const params = new URLSearchParams({ url: url.trim() })
      if (sessionId) params.append('session_id', sessionId)
      fetch(`/api/formats?${params}`)
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
  }, [url, sessionId])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!url.trim()) {
      setError('Please enter a video URL.')
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('url', url.trim())
      if (usePreset) {
        form.append('quality', preset)
      } else {
        form.append('format_id', formatId)
        form.append('quality', '')
      }
      form.append('session_id', sessionId)
      const res = await fetch('/api/download', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Download failed')
      onJobCreated(data.job_id, { url: url.trim(), quality: usePreset ? preset : formatId })
      setUrl('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkSubmit(e) {
    e.preventDefault()
    setMultiError('')
    const urls = multiUrls.split(/\n/).map((u) => u.trim()).filter(Boolean)
    if (!urls.length) {
      setMultiError('Paste at least one URL.')
      return
    }
    setMultiLoading(true)
    try {
      const res = await fetch('/api/agent/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, quality: preset, session_id: sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Bulk download failed')
      onJobsCreated?.(data.job_ids || [], { url: '(multiple)', quality: preset })
      setMultiUrls('')
    } catch (err) {
      setMultiError(err.message || 'Something went wrong.')
    } finally {
      setMultiLoading(false)
    }
  }

  const recommended = formats.filter((f) => ['best', 'bestvideo+bestaudio', 'bestaudio'].includes(f.format_id))
  const videoFormats = formats.filter((f) => f.type === 'video')
  const audioFormats = formats.filter((f) => f.type === 'audio')
  const hasUrlFormats = formats.length > 0
  const showFormatList = hasUrlFormats && !usePreset
  const downloadLabel = fetchLoading ? 'Loading formats…' : loading ? 'Starting…' : 'Download'
  const [multiActive, setMultiActive] = useState(false)

  return (
    <section className="quick-download card">
      <h2>Quick Download</h2>
      <p className="hint">Paste a video URL. Formats load automatically — pick Video or Audio, then download.</p>
      <form onSubmit={handleSubmit} className="download-form">
        <div className="field-group">
          <label className="field-label">Video URL</label>
          <input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="url-input"
            disabled={loading}
          />
        </div>
        {url.trim() && (
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
        <button type="submit" className="btn btn-primary" disabled={loading || (url.trim() && fetchLoading)}>
          {downloadLabel}
        </button>
      </form>
      <div
        className={`multi-section ${multiUrls.trim() || multiActive ? 'multi-section--active' : ''}`}
      >
        <span className="multi-section-label">Paste multiple links (one per line)</span>
        <form onSubmit={handleBulkSubmit}>
          <textarea
            placeholder="https://youtube.com/watch?v=...&#10;https://vimeo.com/..."
            value={multiUrls}
            onChange={(e) => setMultiUrls(e.target.value)}
            onFocus={() => setMultiActive(true)}
            onBlur={() => setMultiActive(false)}
            className="multi-textarea"
            rows={4}
            disabled={multiLoading}
          />
          {multiError && <p className="error">{multiError}</p>}
          <button type="submit" className="btn btn-amber" disabled={multiLoading}>
            {multiLoading ? 'Starting…' : 'Download all'}
          </button>
        </form>
      </div>
    </section>
  )
}
