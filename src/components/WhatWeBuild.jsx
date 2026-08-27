import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import bedBunkbed from '../../bed & bunkbed.png'
import builtInCabinet from '../../built in cabinet.png'
import camper from '../../camper.png'
import kiosk from '../../kiosk.png'
import mementoTwo from '../../memento 2.png'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`
const ease = [0.22, 1, 0.36, 1]

const physicalWorks = [
  { title: 'Bed & Bunkbed', image: bedBunkbed, tag: 'Furniture' },
  { title: 'Built-in Cabinet', image: builtInCabinet, tag: 'Furniture' },
  { title: 'Camper Builds', image: camper, tag: 'Custom Build' },
  { title: 'Kiosk', image: kiosk, tag: 'Commercial' },
  { title: 'Mementos', image: mementoTwo, tag: 'Custom Pieces' },
  { title: 'Racks & Shelves', image: asset('racks  & shelves.png'), tag: 'Furniture' },
  { title: 'Rental Pieces', image: asset('rental.png'), tag: 'Rental' },
  { title: 'Signages', image: asset('signatures.png'), tag: 'Brand Display' },
  { title: 'Tables & Counters', image: asset('table & counters.png'), tag: 'Furniture' },
  { title: 'Other Custom Builds', image: asset('others.png'), tag: 'Custom Work' },
]

function BuildCard({ className = '', children, delay = 0 }) {
  return (
    <motion.article
      className={`wwb-card ${className}`}
      initial={{ y: 22, scale: 0.992 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.22 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.article>
  )
}

function ServiceCard({ item, index, onOpen }) {
  return (
    <BuildCard className="wwb-service-card" delay={(index % 5) * 0.035}>
      <button
        type="button"
        className="wwb-service-media wwb-service-media--clickable"
        onClick={() => onOpen(index)}
        aria-label={`View ${item.title} image`}
      >
        <img src={item.image} alt={`Benua Brutti ${item.title}`} />
        <span className="wwb-service-index">{String(index + 1).padStart(2, '0')}</span>
        <span className="wwb-service-view"><Maximize2 size={14} /> View</span>
      </button>
      <div className="wwb-service-meta">
        <div>
          <small>{item.tag}</small>
          <h3>{item.title}</h3>
        </div>
        <button
          type="button"
          className="wwb-service-arrow"
          onClick={() => onOpen(index)}
          aria-label={`Open ${item.title}`}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>
    </BuildCard>
  )
}

function GalleryLightbox({ index, onClose, onChange }) {
  const item = physicalWorks[index]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onChange((index - 1 + physicalWorks.length) % physicalWorks.length)
      if (event.key === 'ArrowRight') onChange((index + 1) % physicalWorks.length)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [index, onClose, onChange])

  const previous = () => onChange((index - 1 + physicalWorks.length) % physicalWorks.length)
  const next = () => onChange((index + 1) % physicalWorks.length)

  return (
    <motion.div
      className="wwb-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} image viewer`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onMouseDown={onClose}
    >
      <motion.div
        className="wwb-lightbox__panel"
        initial={{ y: 18, scale: 0.985, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 12, scale: 0.99, opacity: 0 }}
        transition={{ duration: 0.34, ease }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="wwb-lightbox__topbar">
          <div>
            <span>{item.tag}</span>
            <strong>{item.title}</strong>
          </div>
          <div className="wwb-lightbox__count">
            {String(index + 1).padStart(2, '0')} / {String(physicalWorks.length).padStart(2, '0')}
          </div>
          <button type="button" className="wwb-lightbox__close" onClick={onClose} aria-label="Close image viewer">
            <X size={19} />
          </button>
        </div>

        <div className="wwb-lightbox__stage">
          <button type="button" className="wwb-lightbox__nav wwb-lightbox__nav--prev" onClick={previous} aria-label="Previous image">
            <ChevronLeft size={22} />
          </button>

          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={item.title}
              src={item.image}
              alt={`Benua Brutti ${item.title}`}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.24 }}
            />
          </AnimatePresence>

          <button type="button" className="wwb-lightbox__nav wwb-lightbox__nav--next" onClick={next} aria-label="Next image">
            <ChevronRight size={22} />
          </button>
        </div>

        <div className="wwb-lightbox__footer">
          <span>Use ← → to browse</span>
          <span>Press Esc to close</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function WhatWeBuild() {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  return (
    <section className="what-we-build" aria-labelledby="what-we-build-title">
      <div className="page-shell wwb-shell">
        <div className="wwb-heading">
          <div>
            <p className="wwb-eyebrow"><span /> What we build</p>
            <h2 id="what-we-build-title">Built beyond <em>furniture.</em></h2>
          </div>
          <p className="wwb-intro">
            From furniture and signage to commercial builds and digital products, Benua Brutti turns practical ideas into things people can use.
          </p>
        </div>

        <div className="wwb-section-label">
          <span>01</span>
          <strong>Physical &amp; creative works</strong>
          <i />
        </div>

        <div className="wwb-services-grid">
          {physicalWorks.map((item, index) => (
            <ServiceCard key={item.title} item={item} index={index} onOpen={setLightboxIndex} />
          ))}
        </div>

        <div className="wwb-section-label wwb-section-label--digital">
          <span>02</span>
          <strong>Digital products</strong>
          <i />
        </div>

        <div className="wwb-digital-grid">
          <BuildCard className="wwb-card--digital wwb-card--selesai wwb-selesa-mini" delay={0.06}>
            <div className="wwb-selesa-mini__main">
              <div className="wwb-selesa-mini__top">
                <span>AI home services · Kota Kinabalu</span>
              </div>

              <div className="wwb-selesa-mini__title-row">
                <div className="wwb-selesa-mini__brand">
                  <img
                    className="wwb-selesa-mini__logo"
                    src={asset('logo selesaai.jpg')}
                    alt="SelesaAI"
                  />
                  <p className="wwb-selesa-mini__tagline">Ambil gambar. SelesaAI uruskan.</p>
                </div>
                <a
                  className="wwb-selesa-mini__link"
                  href="https://selesaai.lovable.app"
                  target="_blank"
                  rel="noreferrer"
                >
                  View MVP <ArrowUpRight size={14} />
                </a>
              </div>

              <p className="wwb-product-desc">
                AI understands the home issue from a photo, asks follow-up questions, provides a price estimate, then the team connects the customer with a verified technician.
              </p>

              <div className="wwb-selesa-mini__features">
                <span>AI triage</span>
                <span>Price estimate</span>
                <span>Verified technicians</span>
              </div>
            </div>

            <div className="wwb-selesa-mini__facts" aria-label="SelesaAI MVP facts">
              <div>
                <small>Status</small>
                <strong>Live MVP</strong>
              </div>
              <div>
                <small>Coverage</small>
                <strong>KK &amp; nearby</strong>
              </div>
              <div>
                <small>Services</small>
                <strong>5 categories</strong>
              </div>
            </div>
          </BuildCard>
        </div>

        <div className="wwb-bottom-note">
          <span>One company, multiple ways of building.</span>
          <p>Physical craft and digital problem-solving, developed from the same practical mindset.</p>
        </div>
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <GalleryLightbox
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
