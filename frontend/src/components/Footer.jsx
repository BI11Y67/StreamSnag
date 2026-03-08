import { useState } from 'react'
import './Footer.css'

const GITHUB_URL = 'https://github.com/bi11y67'
const BITCOIN_ADDRESS = 'bc1qdz50swgf4z9n4px3zu0lera9fcnkj5wx3l405g'
const BITCOIN_LINK = `bitcoin:${BITCOIN_ADDRESS}`
const UPI_ID = 'mukeshavik@ybl'

export default function Footer() {
  const [copied, setCopied] = useState(false)

  function handleCopyUpi() {
    navigator.clipboard.writeText(UPI_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <footer className="footer">
      <a href={BITCOIN_LINK} className="footer-link donate" title="Donate via Bitcoin">
        Donate Bitcoin
      </a>
      <span className="footer-sep">·</span>
      <button
        type="button"
        onClick={handleCopyUpi}
        className="footer-link footer-upi-btn"
        title="Copy UPI ID — open PhonePe, GPay, or any UPI app to pay"
      >
        UPI: <strong>{UPI_ID}</strong>
        {copied && <span className="footer-copied">Copied! Open PhonePe, GPay, or any UPI app to pay.</span>}
      </button>
      <span className="footer-sep">·</span>
      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="footer-link github">
        GitHub
      </a>
      <p className="footer-credit">
        Powered by yt-dlp. StreamSnag is for personal use only; respect copyright and platform ToS.
      </p>
    </footer>
  )
}
