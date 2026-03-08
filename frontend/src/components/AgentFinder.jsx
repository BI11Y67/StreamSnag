import { useState } from 'react'
import './AgentFinder.css'

const QUALITIES = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
  { value: '2k', label: '2K' },
  { value: '4k', label: '4K' },
  { value: 'mp3', label: 'MP3' },
]

export default function AgentFinder({ sessionId, onJobsCreated }) {
  const [pageUrl, setPageUrl] = useState('')
  const [extractLoading, setExtractLoading] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [links, setLinks] = useState([])
  const [quality, setQuality] = useState('1080p')
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkError, setBulkError] = useState('')

  async function handleExtract(e) {
    e.preventDefault()
    setExtractError('')
    setLinks([])
    if (!pageUrl.trim()) {
      setExtractError('Please enter a page URL.')
      return
    }
    setExtractLoading(true)
    try {
      const res = await fetch('/api/agent/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_url: pageUrl.trim(), session_id: sessionId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Extract failed')
      setLinks(data.links || [])
      if (!(data.links || []).length) setExtractError('No video links found on this page.')
    } catch (err) {
      setExtractError(err.message || 'Something went wrong.')
    } finally {
      setExtractLoading(false)
    }
  }

  async function handleBulkDownload() {
    if (!links.length) return
    setBulkError('')
    setBulkLoading(true)
    try {
      const res = await fetch('/api/agent/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urls: links,
          quality,
          session_id: sessionId,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Bulk download failed')
      onJobsCreated(data.job_ids || [], { url: '(bulk)', quality })
      setLinks([])
    } catch (err) {
      setBulkError(err.message || 'Something went wrong.')
    } finally {
      setBulkLoading(false)
    }
  }

  function removeLink(idx) {
    setLinks((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <section className="agent-finder card">
      <h2>AI Link Finder</h2>
      <p className="hint">
        Paste a link to an article or webpage. We'll find video URLs (YouTube, Vimeo, etc.) so you can download them — useful when you can't copy the video link directly.
      </p>
      <form onSubmit={handleExtract}>
        <input
          type="url"
          placeholder="https://example.com/article-with-embedded-videos"
          value={pageUrl}
          onChange={(e) => setPageUrl(e.target.value)}
          className="url-input"
          disabled={extractLoading}
        />
        {extractError && <p className="error">{extractError}</p>}
        <button type="submit" className="btn btn-primary" disabled={extractLoading}>
          {extractLoading ? 'Searching…' : 'Find video links'}
        </button>
      </form>

      {links.length > 0 && (
        <div className="links-section">
          <h3>Found {links.length} link(s)</h3>
          <div className="quality-row">
            <label>Download quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="quality-select"
              disabled={bulkLoading}
            >
              {QUALITIES.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>
          <ul className="links-list">
            {links.map((link, i) => (
              <li key={i}>
                <a href={link} target="_blank" rel="noopener noreferrer" className="link-url">
                  {link.length > 60 ? link.slice(0, 60) + '…' : link}
                </a>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeLink(i)}
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          {bulkError && <p className="error">{bulkError}</p>}
          <button
            type="button"
            className="btn btn-amber"
            onClick={handleBulkDownload}
            disabled={bulkLoading}
          >
            {bulkLoading ? 'Starting…' : `Download all (${links.length})`}
          </button>
        </div>
      )}
    </section>
  )
}
