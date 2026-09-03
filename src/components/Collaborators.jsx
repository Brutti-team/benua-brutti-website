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
  'DIDR.png',
  'SK Nexilis.png',
  'rural social enterprise.png',
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

function DraggableRow({ files, label, onOpen, reverse = false, speed = 30 }) {
  const rowRef = useRef(null)
  const frameRef = useRef(null)
  const lastFrameRef = useRef(0)
  const pauseUntilRef = useRef(0)
  const suppressClickUntilRef = useRef(0)
  const dragState = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
    captured: false,
  })

  useEffect(() => {
    const row = rowRef.current
    if (!row) return undefined

    let initialized = false

    const prepareLoop = () => {
      const half = row.scrollWidth / 2
      if (!half) return

      if (!initialized && reverse) {
        row.scrollLeft = half
      }

      initialized = true
    }

    const initialFrame = window.requestAnimationFrame(prepareLoop)

    const animate = (timestamp) => {
      if (!lastFrameRef.current) lastFrameRef.current = timestamp
      const delta = Math.min(timestamp - lastFrameRef.current, 40)
      lastFrameRef.current = timestamp

      const half = row.scrollWidth / 2

      if (
        half > 0 &&
        timestamp >= pauseUntilRef.current &&
        !dragState.current.active
      ) {
        const movement = (speed * delta) / 1000
        row.scrollLeft += reverse ? -movement : movement

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

    const resizeObserver = new ResizeObserver(prepareLoop)
    resizeObserver.observe(row)

    return () => {
      window.cancelAnimationFrame(initialFrame)
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current)
      resizeObserver.disconnect()
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
      captured: false,
    }
  }

  const handlePointerMove = (event) => {
    const row = rowRef.current
    const state = dragState.current
    if (!row || !state.active || state.pointerId !== event.pointerId) return

    const delta = event.clientX - state.startX

    if (!state.moved && Math.abs(delta) > 7) {
      state.moved = true
      row.classList.add('is-dragging')

      try {
        row.setPointerCapture?.(event.pointerId)
        state.captured = true
      } catch {
        state.captured = false
      }
    }

    if (!state.moved) return

    row.scrollLeft = state.startScrollLeft - delta
  }

  const finishDrag = (event) => {
    const row = rowRef.current
    const state = dragState.current
    if (!row || !state.active) return

    if (state.captured && state.pointerId === event.pointerId) {
      try {
        if (row.hasPointerCapture?.(event.pointerId)) {
          row.releasePointerCapture(event.pointerId)
        }
      } catch {
        // Pointer capture may already have been released by the browser.
      }
    }

    if (state.moved) {
      suppressClickUntilRef.current = performance.now() + 260
      pauseUntilRef.current = performance.now() + 650
    }

    dragState.current = {
      active: false,
      pointerId: null,
      startX: 0,
      startScrollLeft: row.scrollLeft,
      moved: false,
      captured: false,
    }

    row.classList.remove('is-dragging')
  }

  const handleClickCapture = (event) => {
    if (performance.now() > suppressClickUntilRef.current) return

    event.preventDefault()
    event.stopPropagation()
  }

  const handleKeyDown = (event) => {
    const row = rowRef.current
    if (!row) return

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      pauseUntilRef.current = performance.now() + 900
      row.scrollBy({ left: 280, behavior: 'smooth' })
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      pauseUntilRef.current = performance.now() + 900
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
            speed={30}
          />
          <DraggableRow
            files={secondRow}
            label="Collaborators row two"
            onOpen={setSelectedLogo}
            reverse
            speed={26}
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
