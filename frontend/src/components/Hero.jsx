import './Hero.css'

function IconYouTube() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 30 30 0 000 12a30 30 0 00.6 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1 30 30 0 00.6-5.8 30 30 0 00-.6-5.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  )
}

function IconInstagram() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8A3.6 3.6 0 007.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6A3.6 3.6 0 0016.4 4H7.6zm9.65 1.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z"
      />
    </svg>
  )
}

function IconTikTok() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.8v-3.4a6.34 6.34 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43V7.05a8.16 8.16 0 004.77 1.55v-3.4a4.85 4.85 0 01-1-.51z"
      />
    </svg>
  )
}

function IconX() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  )
}

function IconFacebook() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  )
}

function IconVimeo() {
  return (
    <svg className="hero-platform-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609h-.001l-.003.004c-2.679 3.842-4.942 5.766-6.79 5.766-1.137 0-2.11-1.05-2.923-3.152-.532-1.925-.996-3.85-1.49-5.77-.55-2.14-1.14-3.21-1.77-3.21-.137 0-.62.29-1.45.87l-.87-1.12c.92-.763 1.82-1.53 2.7-2.3 1.22-1.02 2.14-1.56 2.76-1.64 1.45-.18 2.35 1.05 2.7 3.69.36 2.84.61 4.61.75 5.31.42 1.91.88 2.87 1.38 2.87.39 0 .98-.62 1.77-1.86.79-1.24 1.21-2.18 1.27-2.82.11-1.09-.31-1.64-1.26-1.64-.45 0-.91.1-1.38.31.91-2.98 2.65-4.43 5.21-4.36 1.9.06 2.8 1.3 2.7 3.72z"
      />
    </svg>
  )
}

const PLATFORMS = [
  { name: 'YouTube', Icon: IconYouTube },
  { name: 'Instagram', Icon: IconInstagram },
  { name: 'TikTok', Icon: IconTikTok },
  { name: 'X', Icon: IconX },
  { name: 'Facebook', Icon: IconFacebook },
  { name: 'Vimeo', Icon: IconVimeo },
]

export default function Hero({ headline, subheadline }) {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero-badge">
        <span className="hero-badge-dot" aria-hidden="true" />
        Free · No signup · Powered by yt-dlp
      </div>
      <h1 id="hero-heading" className="hero-title">
        {headline}
      </h1>
      <p className="hero-subtitle">{subheadline}</p>
      <div className="hero-platforms" role="list" aria-label="Supported platforms">
        {PLATFORMS.map(({ name, Icon }) => (
          <div key={name} className="hero-platform-pill" role="listitem" title={name}>
            <Icon />
            <span className="hero-platform-name">{name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
