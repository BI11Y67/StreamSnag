import { useState } from 'react'
import { FAQ_ITEMS } from '../data/seo'
import './FAQ.css'

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="faq section-block" aria-labelledby="faq-heading">
      <h2 id="faq-heading" className="section-title">
        Frequently asked questions
      </h2>
      <p className="section-lead">Quick answers about StreamSnag, formats, and legal use.</p>
      <div className="faq-list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
              <button
                type="button"
                className="faq-trigger"
                aria-expanded={isOpen}
                id={`faq-btn-${i}`}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="faq-q">{item.q}</span>
                <span className="faq-chevron" aria-hidden="true">
                  {isOpen ? '−' : '+'}
                </span>
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-btn-${i}`}
                className="faq-panel"
                hidden={!isOpen}
              >
                <p className="faq-a">{item.a}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
