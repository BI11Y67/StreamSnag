import { useState, useRef } from 'react'
import './CookieUpload.css'

export default function CookieUpload({ sessionId }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [hasFile, setHasFile] = useState(false)
  const inputRef = useRef(null)

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
      setMessage('Cookies uploaded. They will be used for bulk or age-restricted downloads.')
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
      <details className="cookie-details">
        <summary>Upload cookies (for bulk / age-restricted downloads)</summary>
        <p className="cookie-hint">
          If YouTube or another site asks for login when downloading in bulk or for restricted videos, export your cookies (e.g. with a browser extension) and upload the .txt file here.
        </p>
        <div className="cookie-row">
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.cookies"
            onChange={handleFile}
            disabled={uploading}
            className="cookie-input"
          />
          {message && (
            <span className={hasFile ? 'cookie-ok' : 'cookie-err'}>{message}</span>
          )}
        </div>
      </details>
    </div>
  )
}
