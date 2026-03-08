import { useState } from 'react'
import './QuickDownload.css'

const QUALITIES = [
  { value: '360p', label: '360p' },
  { value: '480p', label: '480p' },
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
  { value: 'mp3', label: 'MP3' },
  { value: 'm4a', label: 'M4A (audio)' },
]

export default function QuickDownload({ sessionId, onJobCreated, onJobsCreated }) {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('1080p')
  const [formats, setFormats] = useState([])
  const [formatId, setFormatId] = useState('')
  const [useDynamicFormats, setUseDynamicFormats] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [multiUrls, setMultiUrls] = useState('')
  const [multiLoading, setMultiLoading] = useState(false)
  const [multiError, setMultiError] = useState('')

  async function handleGetFormats(e) {
    e.preventDefault()
    setError('')
    if (!url.trim()) {
      setError('Paste a URL first.')
      return
    }
    setFetchLoading(true)
    try {
      const params = new URLSearchParams({ url: url.trim() })
      if (sessionId) params.append('session_id', sessionId)
      const res = await fetch(`/api/formats?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Could not fetch formats')
      setFormats(data.formats || [])
      setFormatId(data.formats?.[0]?.format_id || '')
      setUseDynamicFormats(true)
    } catch (err) {
      setError(err.message || 'Could not fetch formats.')
    } finally {
      setFetchLoading(false)
    }
  }

  function handleUsePresets() {
    setUseDynamicFormats(false)
    setFormats([])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!url.trim()) {
      setError('Please enter a video URL.')
      return
    }
    if (useDynamicFormats && !formatId) {
      setError('Pick a format or use presets.')
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      form.append('url', url.trim())
      if (useDynamicFormats && formatId) {
        form.append('format_id', formatId)
        form.append('quality', '') // not used when format_id is set
      } else {
        form.append('quality', quality)
      }
      form.append('session_id', sessionId)
      const res = await fetch('/api/download', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Download failed')
      onJobCreated(data.job_id, { url: url.trim(), quality: useDynamicFormats ? formatId : quality })
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
        body: JSON.stringify({ urls, quality, session_id: sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Bulk download failed')
      onJobsCreated?.(data.job_ids || [], { url: '(multiple)', quality })
      setMultiUrls('')
    } catch (err) {
      setMultiError(err.message || 'Something went wrong.')
    } finally {
      setMultiLoading(false)
    }
  }

  return (
    <section className="quick-download card">
      <h2>Paste a video link</h2>
      <p className="hint">Paste a URL, then get available formats or use presets. Use the Playlist tab for whole playlists.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          disabled={loading}
        />
        <div className="format-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleGetFormats}
            disabled={fetchLoading || loading || !url.trim()}
          >
            {fetchLoading ? 'Fetching…' : 'Get available formats'}
          </button>
          {useDynamicFormats && (
            <button type="button" className="btn-link" onClick={handleUsePresets}>
              Use presets instead
            </button>
          )}
        </div>
        {useDynamicFormats && formats.length > 0 ? (
          <div className="quality-row">
            <label>Available formats</label>
            <select
              value={formatId}
              onChange={(e) => setFormatId(e.target.value)}
              className="quality-select format-select"
              disabled={loading}
            >
              {formats.map((f) => (
                <option key={f.format_id} value={f.format_id}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="quality-row">
            <label>Quality / format (preset)</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="quality-select"
              disabled={loading}
            >
              {QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Starting…' : 'Download'}
        </button>
      </form>
      <details className="multi-details">
        <summary>Or paste multiple links (one per line)</summary>
        <form onSubmit={handleBulkSubmit}>
          <textarea
            placeholder="https://youtube.com/watch?v=...&#10;https://vimeo.com/..."
            value={multiUrls}
            onChange={(e) => setMultiUrls(e.target.value)}
            className="multi-textarea"
            rows={4}
            disabled={multiLoading}
          />
          <div className="quality-row">
            <label>Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="quality-select"
              disabled={multiLoading}
            >
              {QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
          {multiError && <p className="error">{multiError}</p>}
          <button type="submit" className="btn btn-amber" disabled={multiLoading}>
            {multiLoading ? 'Starting…' : 'Download all'}
          </button>
        </form>
      </details>
    </section>
  )
}
