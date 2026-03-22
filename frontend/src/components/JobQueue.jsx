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
          <span className="job-save-wrap">
            <button
              type="button"
              className={`btn-download ${saved ? 'btn-download-saved' : ''}`}
              onClick={handleDownload}
              disabled={downloading}
              title="Export queue"
            >
              {downloading ? '…' : saved ? 'Saved!' : 'Save list'}
            </button>
            <span className="job-save-hint">Export queue</span>
          </span>
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

export default function JobQueue({ jobs, onUpdate, compact = false }) {
  return (
    <section className={`job-queue ${compact ? 'job-queue--compact' : ''} ${!jobs.length ? 'job-queue--empty' : ''}`}>
      <h3>
        Download queue
        {jobs.length > 0 && (
          <span className="job-queue-count"> — {jobs.length} {jobs.length === 1 ? 'video' : 'videos'} queued</span>
        )}
      </h3>
      {jobs.length === 0 ? (
        <p className="job-queue-empty">No downloads yet. Queued links will appear here.</p>
      ) : (
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
      )}
    </section>
  )
}
