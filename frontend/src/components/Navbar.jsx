import { NavLink, Link } from 'react-router-dom'
import './Navbar.css'

const ROUTES = [
  { to: '/', label: 'Home', end: true },
  { to: '/youtube-downloader', label: 'YouTube' },
  { to: '/instagram-downloader', label: 'Instagram' },
  { to: '/tiktok-downloader', label: 'TikTok' },
]

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand" end>
          <span className="navbar-logo">StreamSnag</span>
        </NavLink>
        <nav className="navbar-links" aria-label="Main">
          <Link to="/#download" className="navbar-link">
            Download
          </Link>
          {ROUTES.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'navbar-link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
