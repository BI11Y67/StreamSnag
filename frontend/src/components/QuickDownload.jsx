import { useState } from 'react'
import './QuickDownload.css'

const QUALITIES = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
  { value: 'mp3', label: 'MP3' },
]

export default function QuickDownload({ sessionId, onJobCreated, onJobsCreated }) {
  const [url, setUrl] = useState('')
  const [quality, setQuality] = useState('1080p')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [multiUrls, setMultiUrls] = useState('')
  const [multiLoading, setMultiLoading] = useState(false)
  const [multiError, setMultiError] = useState('')

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
      form.append('quality', quality)
      form.append('session_id', sessionId)
      const res = await fetch('/api/download', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Download failed')
      onJobCreated(data.job_id, { url: url.trim(), quality })
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
      <p className="hint">YouTube, Vimeo, Twitter/X, Dailymotion, and 1000+ sites supported. Paste a playlist URL to download the whole playlist.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="url-input"
          disabled={loading}
        />
        <div className="quality-row">
          <label>Quality / format</label>
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
