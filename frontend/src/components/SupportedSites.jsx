import { useState } from 'react'
import './SupportedSites.css'

const SITES = [
  'YouTube', 'Instagram', 'X (Twitter)', 'TikTok', 'Vimeo', 'Dailymotion', 'Twitch',
  'SoundCloud', 'Bandcamp', 'Facebook', 'Reddit', 'TED', 'BitChute', 'Odysee',
]

const TIPS = [
  { title: '403 or bot error?', text: 'Upload your cookies from a logged-in browser to bypass restrictions.' },
  { title: 'Format unavailable?', text: 'Try a lower quality (e.g. 720p or 480p) or MP3 for audio.' },
  { title: 'Playlist download', text: 'Use the Playlist tab (Premium) to grab entire playlists.' },
  { title: 'AI Link Finder', text: 'Paste a page URL to extract video links when you can\'t copy them.' },
]

export default function SupportedSites() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section className="supported-sites">
      <button type="button" className="sites-toggle" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
        {expanded ? 'Collapse' : 'Supported sites & tips'}
      </button>
      {expanded && (
        <div className="sites-content">
          <div className="how-it-works">
            <h4>How it works</h4>
            <p>Paste a video URL → pick a quality or format → click Download. Formats load automatically from YouTube, Instagram, X, and more.</p>
          </div>
          <div className="sites-list">
            <h4>1000+ sites supported</h4>
            <p className="sites-tags">{SITES.join(' · ')}</p>
          </div>
          <div className="tips-list">
            <h4>Tips</h4>
            <ul>
              {TIPS.map((t, i) => (
                <li key={i}>
                  <strong>{t.title}</strong> — {t.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  )
}
