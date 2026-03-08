import { useEffect, useState } from 'react'
import './JobQueue.css'

function JobItem({ jobId, meta, onUpdate }) {
  const [status, setStatus] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function poll() {
      try {
        const res = await fetch(`/api/jobs/${jobId}`)
        const data = await res.json()
        if (cancelled) return
        setStatus(data)
        onUpdate?.(jobId, data)
        if (data.status === 'downloading' || data.status === 'processing' || data.status === 'started') {
          setTimeout(poll, 1500)
        }
      } catch {
        if (!cancelled) setStatus({ status: 'error', error: 'Unable to check download status. Check your connection and try again.' })
      }
    }
    poll()
    return () => { cancelled = true }
  }, [jobId, onUpdate])

  async function handleDownload() {
    setDownloading(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/jobs/${jobId}/file`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (status?.info?.title || 'video') + (meta?.quality === 'mp3' ? '.mp3' : meta?.quality === 'm4a' ? '.m4a' : '.mp4')
      a.click()
      URL.revokeObjectURL(url)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setDownloading(false)
    }
  }

  if (!status) return <li className="job-item">Loading…</li>

  const { status: s, progress, error, info, suggestion } = status
  const label = info?.title || meta?.url || jobId.slice(0, 8)

  return (
    <li className="job-item">
      <span className="job-label" title={meta?.url || jobId}>{label}</span>
      <span className="job-status">
        {s === 'completed' && (
          <button
            type="button"
            className={`btn-download ${saved ? 'btn-download-saved' : ''}`}
            onClick={handleDownload}
            disabled={downloading}
            title="Download the file to your device"
          >
            {downloading ? '…' : saved ? 'Saved!' : 'Save file'}
          </button>
        )}
        {s === 'downloading' && (
          <span className="progress">{progress ?? 0}%</span>
        )}
        {(s === 'started' || s === 'processing') && <span>Preparing…</span>}
        {s === 'error' && (
          <span>
            <span className="job-error">{error}</span>
            {suggestion && <span className="job-suggestion"> — {suggestion}</span>}
          </span>
        )}
      </span>
    </li>
  )
}

export default function JobQueue({ jobs, onUpdate }) {
  if (!jobs.length) return null

  return (
    <section className="job-queue">
      <h3>Download queue</h3>
      <ul className="job-list">
        {jobs.map((j) => (
          <JobItem
            key={j.id}
            jobId={j.id}
            meta={j}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </section>
  )
}
