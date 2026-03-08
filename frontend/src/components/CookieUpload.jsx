import { useState, useRef } from 'react'
import './CookieUpload.css'

export default function CookieUpload({ sessionId }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const inputRef = useRef(null)

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

  return (
    <div className="cookie-upload">
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
        {uploading ? 'Uploading…' : hasFile ? 'Cookies uploaded — click to replace' : 'Upload cookies'}
      </button>
      <p className="cookie-hint">For bulk or age-restricted downloads. Export cookies with a browser extension.</p>
      {message && !hasFile && <span className="cookie-err">{message}</span>}
    </div>
  )
}
