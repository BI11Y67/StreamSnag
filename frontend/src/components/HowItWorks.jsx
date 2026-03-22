import './HowItWorks.css'

const STEPS = [
  {
    title: 'Paste the link',
    text: 'Copy any public video URL from your browser — YouTube, Instagram, TikTok, X, and more.',
    icon: 'link',
  },
  {
    title: 'Pick quality',
    text: 'Choose a preset (360p–4K, MP3, M4A) or load formats from the URL for full control.',
    icon: 'sliders',
  },
  {
    title: 'Download',
    text: 'Start the job and save the file when it’s ready. Use playlists or bulk paste for multiple links.',
    icon: 'download',
  },
]

function StepIcon({ name }) {
  if (name === 'link') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
      </svg>
    )
  }
  if (name === 'sliders') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export default function HowItWorks() {
  return (
    <section className="how-it-works section-block" aria-labelledby="how-heading">
      <h2 id="how-heading" className="section-title">
        How it works
      </h2>
      <p className="section-lead">Three steps from link to file — no installs, no clutter.</p>
      <ol className="how-steps">
        {STEPS.map((step, i) => (
          <li key={step.title} className="how-step">
            <div className="how-step-icon-wrap">
              <span className="how-step-num">{i + 1}</span>
              <div className="how-step-icon">
                <StepIcon name={step.icon} />
              </div>
            </div>
            <h3 className="how-step-title">{step.title}</h3>
            <p className="how-step-text">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
