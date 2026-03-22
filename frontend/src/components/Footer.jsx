import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

const GITHUB_URL = 'https://github.com/bi11y67'
const BITCOIN_ADDRESS = 'bc1qdz50swgf4z9n4px3zu0lera9fcnkj5wx3l405g'
const BITCOIN_LINK = `bitcoin:${BITCOIN_ADDRESS}`
const UPI_ID = 'mukeshavik@ybl'
const UPI_PAYEE = 'StreamSnag'
const PHONEPE_LINK = `phonepe://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE)}&cu=INR`
const GPAY_LINK = `tez://upi/pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE)}&cu=INR`

const FOOTER_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/youtube-downloader', label: 'YouTube Downloader' },
  { to: '/instagram-downloader', label: 'Instagram Downloader' },
  { to: '/tiktok-downloader', label: 'TikTok Downloader' },
]

const IconBitcoin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M14.76 10.45c.24-.14.57-.27.83-.39 2.15-.89 3.67-2.12 3.09-4.56-.5-2.12-2.15-3.12-4.47-3.63V2h-1.5v3.04h-1.22V2H10.2v3.04H6.96V7.1h4.69c.98.04 1.92.31 1.94 1.2 0 .52-.25.93-.71 1.18-1.57.74-3.13 1.48-4.7 2.23 1.35.59 2.35 1.09 3.35 1.6 1.22.55 2.42 1.09 3.63 1.56 1.03.4 2.06.71 3.15.71 1.56 0 2.8-.5 3.62-1.67.95-1.36.78-3.23-.04-4.32zm-2.97-4.93h1.45c1.17 0 1.94.6 1.94 1.5 0 .95-.8 1.5-2 1.5H11.8V5.52zm.97 6.08c.85 0 1.7-.23 2.53-.7-.96-.45-1.9-.91-2.84-1.36-1.03-.48-2.06-.96-3.07-1.47 1.14-.54 2.29-1.04 3.38-1.53z" />
  </svg>
)

const IconUPI = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15v-4H8v-2h2V8h2v5h2v-2h-2v-2h2.5c1.38 0 2.5 1.12 2.5 2.5S15.88 17 14.5 17H12z" />
  </svg>
)

const IconGitHub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
  </svg>
)

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function check() {
      const mq = window.matchMedia('(max-width: 767px)')
      const touch = 'ontouchstart' in window
      const coarse = window.matchMedia('(pointer: coarse)').matches
      setIsMobile(mq.matches || touch || coarse)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function handleCopyUpi(e) {
    e.preventDefault()
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <footer className="footer">
      <nav className="footer-nav" aria-label="Site">
        <ul className="footer-nav-list">
          {FOOTER_LINKS.map(({ to, label }) => (
            <li key={to}>
              <Link to={to} className="footer-nav-link">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <a href="/#download" className="footer-nav-link">
              Download
            </a>
          </li>
        </ul>
      </nav>

      <p className="footer-msg">No ads — we keep the experience clean. If you use this often, please consider donating.</p>
      <div className="footer-support">
        <a href={BITCOIN_LINK} className="footer-btn footer-btn-bitcoin" title="Donate via Bitcoin">
          <IconBitcoin />
          <span>Bitcoin</span>
        </a>
        <div className="footer-upi-group">
          {isMobile && (
            <>
              <a href={PHONEPE_LINK} className="footer-btn footer-btn-upi footer-btn-phonepe" title="Pay via PhonePe">
                <IconUPI />
                <span>PhonePe</span>
              </a>
              <a href={GPAY_LINK} className="footer-btn footer-btn-upi footer-btn-gpay" title="Pay via Google Pay">
                <IconUPI />
                <span>GPay</span>
              </a>
            </>
          )}
          <button
            type="button"
            onClick={handleCopyUpi}
            className="footer-btn footer-btn-upi footer-btn-copy"
            title="Copy UPI ID — paste in Paytm, BHIM, or any UPI app"
            aria-label="Copy UPI ID"
          >
            <IconUPI />
            <span>{copied ? 'Copied!' : 'Copy UPI ID'}</span>
          </button>
        </div>
        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer-btn footer-btn-github" title="GitHub">
          <IconGitHub />
          <span>GitHub</span>
        </a>
      </div>
      <p className="footer-upi-note">Prefer PhonePe or GPay? Copy the UPI ID and paste in your app.</p>

      <p className="footer-seo">
        <strong>StreamSnag</strong> is a free online video downloader for personal use. Save videos from{' '}
        <Link to="/youtube-downloader">YouTube</Link>, <Link to="/instagram-downloader">Instagram</Link>,{' '}
        <Link to="/tiktok-downloader">TikTok</Link>, X (Twitter), Facebook, Vimeo, and hundreds of other sites supported by
        yt-dlp. Paste a URL, choose quality or format, and download MP4, WebM, or audio. Always respect copyright and each
        platform&rsquo;s terms of service.
      </p>

      <p className="footer-credit">Powered by yt-dlp. Uses FFmpeg. Personal use only; respect copyright and platform ToS.</p>
    </footer>
  )
}
