import { useState, useCallback } from 'react'
import Header from './components/Header'
import QuickDownload from './components/QuickDownload'
import AgentFinder from './components/AgentFinder'
import CookieUpload from './components/CookieUpload'
import JobQueue from './components/JobQueue'
import Footer from './components/Footer'
import './App.css'

const TABS = [
  { id: 'download', label: 'Quick Download' },
  { id: 'agent', label: 'AI Link Finder' },
]

export default function App() {
  const [tab, setTab] = useState('download')
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).slice(2, 12))
  const [jobs, setJobs] = useState([])

  const addJob = useCallback((jobId, meta = {}) => {
    setJobs((prev) => [...prev, { id: jobId, ...meta }])
  }, [])

  const updateJob = useCallback((jobId, data) => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, ...data } : j)))
  }, [])

  const addJobs = useCallback((jobIds, meta) => {
    if (Array.isArray(jobIds)) jobIds.forEach((id) => addJob(id, meta))
  }, [addJob])

  return (
    <div className="app">
      <Header />
      <CookieUpload sessionId={sessionId} />
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      <main className="main">
        {tab === 'download' && (
          <QuickDownload sessionId={sessionId} onJobCreated={addJob} onJobsCreated={addJobs} />
        )}
        {tab === 'agent' && (
          <AgentFinder sessionId={sessionId} onJobsCreated={addJobs} />
        )}
      </main>
      <JobQueue jobs={jobs} onUpdate={updateJob} />
      <Footer />
    </div>
  )
}
