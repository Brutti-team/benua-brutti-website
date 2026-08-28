import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const collaboratorFiles = [
  'appgm.png',
  'art gallery.png',
  'artisan market.png',
  'bakemates.png',
  'ekuinas.png',
  'glamping .png',
  'insken.png',
  'kolej komuniti.png',
  'light in the sea.png',
  'mara.png',
  'mror.png',
  'mtib.png',
  'muaythai.png',
  'ntw.png',
  'pks.png',
  'politeknik.png',
  'risda.png',
  'riuh .png',
  'rtm.png',
  'scenic.png',
  'shell livewire.png',
  'sicc.png',
  'sosea.png',
  'the art.png',
  'the pari.png',
  'yayasan axiata.png',
  'yayasan hasanah',
]

const logoScale = {
  'art gallery.png': 1.16,
  'glamping .png': 1.28,
  'kolej komuniti.png': 1.12,
  'light in the sea.png': 1.18,
  'mara.png': 1.14,
  'mtib.png': 1.16,
  'ntw.png': 1.12,
  'pks.png': 1.12,
  'risda.png': 1.15,
  'rtm.png': 1.12,
  'scenic.png': 1.14,
  'sicc.png': 1.1,
  'the art.png': 1.22,
  'the pari.png': 1.28,
  'yayasan hasanah': 1.34,
}

const displayName = (file) =>
  file
    .replace(/\.png$/i, '')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

function LogoCard({ file, onOpen }) {
  return (
    <button
      type="button"
      className="collab-card"
      title={`View ${displayName(file)} logo`}
      aria-label={`View ${displayName(file)} logo`}
      onClick={() => onOpen(file)}
    >
      <img
        src={asset(`collabolator brutti/${file}`)}
        alt={`${displayName(file)} logo`}
        loading="lazy"
        draggable="false"
        style={{ '--logo-scale': logoScale[file] || 1 }}
      />
    </button>
  )
}

function DraggableRow({ files, label, onOpen, reverse = false, speed = 0.34 }) {
  const rowRef = useRef(null)
  const frameRef = useRef(null)
  const pauseUntilRef = useRef(0)
  const suppressClickRef = useRef(false)
  const dragState = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  })

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined

    let ready = false

    const prepareLoop = () => {
      const half = row.scrollWidth / 2
      if (!half) return
      if (!ready && reverse) row.scrollLeft = half
      ready = true
    }

    prepareLoop()

    const animate = () => {
      const half = row.scrollWidth / 2
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

      if (half && !reduceMotion && Date.now() >= pauseUntilRef.current && !dragState.current.active) {
        row.scrollLeft += reverse ? -speed : speed

        if (!reverse && row.scrollLeft >= half) {
          row.scrollLeft -= half
        }

        if (reverse && row.scrollLeft <= 0) {
          row.scrollLeft += half
        }
      }

      frameRef.current = window.requestAnimationFrame(animate)
    }

    frameRef.current = window.requestAnimationFrame(animate)
    window.addEventListener('resize', prepareLoop)

    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', prepareLoop)
    }
  }, [reverse, speed])

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const row = rowRef.current
    if (!row) return

    dragState.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: row.scrollLeft,
      moved: false,
    }

    pauseUntilRef.current = Date.now() + 10000
    row.classList.add('is-dragging')
    row.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const row = rowRef.current
    const state = dragState.current
    if (!row || !state.active || state.pointerId !== event.pointerId) return

    const delta = event.clientX - state.startX
    if (Math.abs(delta) > 8) {
      state.moved = true
      suppressClickRef.current = true
    }

    row.scrollLeft = state.startScrollLeft - delta
  }

  const finishDrag = (event) => {
    const row = rowRef.current
    const state = dragState.current
    if (!row || !state.active) return

    if (state.pointerId === event.pointerId) {
      row.releasePointerCapture?.(event.pointerId)
    }

    state.active = false
    state.pointerId = null
    row.classList.remove('is-dragging')
    pauseUntilRef.current = Date.now() + (state.moved ? 900 : 180)
  }

  const handleClickCapture = (event) => {
    if (!suppressClickRef.current) return
    suppressClickRef.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  const handleKeyDown = (event) => {
    const row = rowRef.current
    if (!row) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      pauseUntilRef.current = Date.now() + 1200
      row.scrollBy({ left: 280, behavior: 'smooth' })
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      pauseUntilRef.current = Date.now() + 1200
      row.scrollBy({ left: -280, behavior: 'smooth' })
    }
  }

  const repeatedFiles = [...files, ...files]

  return (
    <div
      ref={rowRef}
      className="collaborators-row"
      role="group"
      tabIndex="0"
      aria-label={`${label}. Drag or swipe horizontally to explore. Click a logo to view it.`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClickCapture={handleClickCapture}
      onKeyDown={handleKeyDown}
    >
      <div className="collaborators-track">
        {repeatedFiles.map((file, index) => (
          <LogoCard key={`${label}-${file}-${index}`} file={file} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}

function Collaborators() {
  const [selectedLogo, setSelectedLogo] = useState(null)
  const firstRow = collaboratorFiles.filter((_, index) => index % 2 === 0)
  const secondRow = collaboratorFiles.filter((_, index) => index % 2 === 1)

  useEffect(() => {
    if (!selectedLogo) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedLogo(null)
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedLogo])

  return (
    <>
      <section className="collaborators-section" aria-label="Strategic collaborators">
        <div className="collaborators-head page-shell">
          <div>
            <p className="collaborators-eyebrow">Our network</p>
            <h2>Strategic <em>collaborators.</em></h2>
          </div>
          <p className="collaborators-copy">
            Organisations, communities and partners who have been part of Brutti&apos;s journey.
          </p>
        </div>

        <div className="collaborators-marquee">
          <DraggableRow
            files={firstRow}
            label="Collaborators row one"
            onOpen={setSelectedLogo}
            speed={0.34}
          />
          <DraggableRow
            files={secondRow}
            label="Collaborators row two"
            onOpen={setSelectedLogo}
            reverse
            speed={0.3}
          />
        </div>
      </section>

      {selectedLogo && (
        <div
          className="collab-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${displayName(selectedLogo)} logo preview`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedLogo(null)
          }}
        >
          <div className="collab-lightbox__panel">
            <div className="collab-lightbox__head">
              <div>
                <span>Collaborator</span>
                <strong>{displayName(selectedLogo)}</strong>
              </div>
              <button
                type="button"
                className="collab-lightbox__close"
                onClick={() => setSelectedLogo(null)}
                aria-label="Close collaborator preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="collab-lightbox__visual">
              <img
                src={asset(`collabolator brutti/${selectedLogo}`)}
                alt={`${displayName(selectedLogo)} logo enlarged`}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Collaborators
