import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SeoHead from '../components/SeoHead'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import QuickDownload from '../components/QuickDownload'
import PlaylistDownload from '../components/PlaylistDownload'
import SupportedSites from '../components/SupportedSites'
import HowItWorks from '../components/HowItWorks'
import PlatformLogos from '../components/PlatformLogos'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'
import { PLATFORM_SEO } from '../data/seo'
import '../App.css'

const PATH_TO_KEY = {
  '/': 'home',
  '/youtube-downloader': 'youtube',
  '/instagram-downloader': 'instagram',
  '/tiktok-downloader': 'tiktok',
}

const TABS = [
  { id: 'download', label: 'Quick Download' },
  { id: 'playlist', label: 'Playlist' },
  { id: 'agent', label: 'AI Link Finder (Coming soon)' },
]

export default function DownloadPage({ sessionId, jobs, addJob, addJobs, updateJob }) {
  const location = useLocation()
  const key = PATH_TO_KEY[location.pathname] || 'home'
  const seo = PLATFORM_SEO[key] || PLATFORM_SEO.home
  const [tab, setTab] = useState('download')

  return (
    <>
      <SeoHead title={seo.title} description={seo.description} path={seo.path} />
      <div className="app app-landing">
        <Navbar />
        <Hero headline={seo.headline} subheadline={seo.subheadline} />

        <div id="download" className="download-workspace">
          <nav className="tabs" aria-label="Download modes">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                aria-selected={tab === t.id}
              >
                {t.label}
              </button>
            ))}
          </nav>
          <main className="main">
            {tab === 'download' && (
              <QuickDownload
                sessionId={sessionId}
                onJobCreated={addJob}
                onJobsCreated={addJobs}
                jobs={jobs}
                onUpdate={updateJob}
              />
            )}
            {tab === 'playlist' && (
              <PlaylistDownload
                sessionId={sessionId}
                onJobsCreated={addJobs}
                jobs={jobs}
                onUpdate={updateJob}
              />
            )}
            {tab === 'agent' && (
              <section className="coming-soon card">
                <h2>AI Link Finder</h2>
                <p className="coming-soon-text">
                  Coming soon — paste a page URL to extract video links when you can&apos;t copy them directly.
                  We&apos;ll ship this in a future update.
                </p>
              </section>
            )}
          </main>
        </div>

        <HowItWorks />
        <PlatformLogos />
        <SupportedSites />
        <FAQ />
        <Footer />
      </div>
    </>
  )
}
