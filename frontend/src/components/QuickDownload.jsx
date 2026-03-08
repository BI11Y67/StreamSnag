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

const URL_EXAMPLES = [
  'https://www.youtube.com/watch?v=...',
  'https://x.com/username/status/...',
  'https://www.instagram.com/reel/...',
]

export default function QuickDownload({ sessionId, onJobCreated, onJobsCreated }) {
  const [url, setUrl] = useState('')
  const [formats, setFormats] = useState([])
  const [formatId, setFormatId] = useState('best')
  const [formatListOpen, setFormatListOpen] = useState(false)
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
      const msg = err.message || 'Something went wrong.'
      setError(msg.includes('fetch') || msg.includes('Network') ? 'Unable to connect. Check your internet and try again.' : msg)
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

  const recommended = formats.filter((f) => ['best', 'bestaudio'].includes(f.format_id))
  const videoFormats = formats.filter((f) => f.type === 'video')
  const audioFormats = formats.filter((f) => f.type === 'audio')
  const hasUrlFormats = formats.length > 0
  const showFormatList = hasUrlFormats && !usePreset
  const downloadLabel = fetchLoading ? 'Loading formats…' : loading ? 'Starting…' : 'Download'
  const [multiActive, setMultiActive] = useState(false)
  const [urlPlaceholderIndex, setUrlPlaceholderIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setUrlPlaceholderIndex((i) => (i + 1) % URL_EXAMPLES.length)
    }, 2800)
    return () => clearInterval(t)
  }, [])

  const selectedFormatLabel = formats.find((f) => f.format_id === formatId)?.label || formatId

  function handleFormatSelect(id) {
    setFormatId(id)
    setFormatListOpen(false)
  }

  return (
    <section className="quick-download card">
      <h2>Quick Download</h2>
      <p className="hint">Download videos from YouTube, Instagram, X, and more. Paste a URL, pick a format, then download.</p>
      <form onSubmit={handleSubmit} className="download-form">
        <div className="field-group url-field-wrap">
          <label className="field-label" htmlFor="quick-url-input">Video URL</label>
          <div className="url-input-container">
            <input
              id="quick-url-input"
              type="url"
              placeholder=" "
              autoComplete="url"
              title="Paste a video URL from YouTube, Instagram, X, or any supported site"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
              disabled={loading}
            />
            {!url && (
              <span key={urlPlaceholderIndex} className="url-placeholder-cycle">
                {URL_EXAMPLES[urlPlaceholderIndex]}
              </span>
            )}
          </div>
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
                onClick={() => {
                  setUsePreset(true)
                  setFormatListOpen(false)
                }}
                disabled={loading}
              >
                Preset
              </button>
              <button
                type="button"
                className={`format-tab ${!usePreset ? 'active' : ''}`}
                onClick={() => {
                  setUsePreset(false)
                  setFormatListOpen(true)
                }}
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
              <div className="format-dropdown">
                <button
                  type="button"
                  className="format-trigger"
                  onClick={() => setFormatListOpen((o) => !o)}
                  disabled={loading}
                  aria-expanded={formatListOpen}
                  aria-haspopup="listbox"
                >
                  {selectedFormatLabel}
                  <span className="format-chevron">{formatListOpen ? '▲' : '▼'}</span>
                </button>
                {formatListOpen && (
                  <div className="format-list" aria-label="Available formats" role="listbox">
                    <div className="format-list-section">
                      <span className="format-list-heading">Recommended</span>
                      {recommended.map((f) => (
                        <button
                          key={f.format_id}
                          type="button"
                          role="option"
                          aria-selected={formatId === f.format_id}
                          className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                          onClick={() => handleFormatSelect(f.format_id)}
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
                            role="option"
                            aria-selected={formatId === f.format_id}
                            className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                            onClick={() => handleFormatSelect(f.format_id)}
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
                            role="option"
                            aria-selected={formatId === f.format_id}
                            className={`format-option ${formatId === f.format_id ? 'active' : ''}`}
                            onClick={() => handleFormatSelect(f.format_id)}
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
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading || (url.trim() && fetchLoading)} title="Start download">
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
          <div className="multi-quality-row">
            <label className="multi-quality-label">Download as</label>
            <select value={preset} onChange={(e) => setPreset(e.target.value)} className="quality-select" disabled={multiLoading}>
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
          {multiError && <p className="error">{multiError}</p>}
          <button type="submit" className="btn btn-amber" disabled={multiLoading}>
            {multiLoading ? 'Starting…' : 'Download all'}
          </button>
        </form>
      </div>
    </section>
  )
}
