import './Footer.css'

const GITHUB_URL = 'https://github.com/bi11y67'
const DONATE_URL = '#' // Add your Bitcoin donate link
const UPI_ID = 'mukeshavik@ybl'
const UPI_LINK = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=StreamSnag&cu=INR`

export default function Footer() {
  return (
    <footer className="footer">
      <a href={DONATE_URL} target="_blank" rel="noopener noreferrer" className="footer-link donate">
        Donate Bitcoin
      </a>
      <span className="footer-sep">·</span>
      <a href={UPI_LINK} className="footer-link footer-upi" title="Pay via UPI (opens UPI app)">
        UPI: <strong>{UPI_ID}</strong>
      </a>
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
