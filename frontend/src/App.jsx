import { useState, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import DownloadPage from './pages/DownloadPage'

export default function App() {
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).slice(2, 12))
  const [jobs, setJobs] = useState([])

  const addJob = useCallback((jobId, meta = {}) => {
    setJobs((prev) => [...prev, { id: jobId, ...meta }])
  }, [])

  const updateJob = useCallback((jobId, data) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...data } : j)))
  }, [])

  const addJobs = useCallback(
    (jobIds, meta) => {
      if (Array.isArray(jobIds)) jobIds.forEach((id) => addJob(id, meta))
    },
    [addJob]
  )

  const pageProps = {
    sessionId,
    jobs,
    addJob,
    addJobs,
    updateJob,
  }

  return (
    <Routes>
      <Route path="/" element={<DownloadPage {...pageProps} />} />
      <Route path="/youtube-downloader" element={<DownloadPage {...pageProps} />} />
      <Route path="/instagram-downloader" element={<DownloadPage {...pageProps} />} />
      <Route path="/tiktok-downloader" element={<DownloadPage {...pageProps} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
