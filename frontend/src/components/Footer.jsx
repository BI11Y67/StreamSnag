import './Footer.css'

const GITHUB_URL = 'https://github.com/bi11y67'
const DONATE_URL = '#' // Add your Bitcoin donate link
const UPI_ID = 'mukeshavik@ybl' // India UPI

export default function Footer() {
  return (
    <footer className="footer">
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="footer-link donate">
        Donate
      </a>
      <span className="footer-sep">·</span>
      <span className="footer-upi" title="India UPI">
        UPI: <code>{UPI_ID}</code>
      </span>
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
