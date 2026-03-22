import { useState, useRef } from 'react'
import './CookieUpload.css'

export default function CookieUpload({ sessionId, compact = false, panel = false, jobsCount = 0 }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const inputRef = useRef(null)

  const cookieStatus = uploading ? 'Uploading…' : hasFile ? 'Cookies loaded' : 'Not uploaded'

  function handleClick() {
    if (uploading) return
    inputRef.current?.click()
  }

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage('')
    setUploading(true)
    try {
      const form = new FormData()
      form.append('session_id', sessionId)
      form.append('file', file)
      const res = await fetch('/api/cookies', {
        method: 'POST',
        body: form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Upload failed')
      setMessage('Cookies uploaded.')
      setHasFile(true)
    } catch (err) {
      setMessage(err.message || 'Upload failed.')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  if (panel) {
    return (
      <div className="cookie-panel">
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.cookies"
          onChange={handleFile}
          disabled={uploading}
          className="cookie-input-hidden"
          aria-hidden
        />
        <p className="cookie-panel-explanation">
          Use cookies if downloads fail, for bulk downloads, or age-restricted videos. Export from your browser with an extension (e.g. &quot;Get cookies.txt&quot;).
        </p>
        <div className="cookie-panel-actions">
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="cookie-panel-btn"
            title="Upload cookies file"
          >
            {uploading ? 'Uploading…' : 'Upload cookies file'}
          </button>
          <span className={`cookie-status-badge ${hasFile ? 'cookie-status-loaded' : ''}`}>
            {cookieStatus}
          </span>
        </div>
        {message && !hasFile && <span className="cookie-err">{message}</span>}
      </div>
    )
  }

  return (
    <div className={`cookie-upload ${compact ? 'cookie-upload--compact' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.cookies"
        onChange={handleFile}
        disabled={uploading}
        className="cookie-input-hidden"
        aria-hidden
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading}
        className="cookie-btn"
        title="Upload cookies for bulk or age-restricted downloads"
      >
        {cookieStatus}
      </button>
      {!compact && (
        <p className="cookie-hint">Use cookies if downloads fail, for bulk downloads, or age-restricted videos.</p>
      )}
      {message && !hasFile && <span className="cookie-err">{message}</span>}
    </div>
  )
}
