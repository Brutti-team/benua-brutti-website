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
  'My Creative Ventures.png',
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

const adjacentLogo = (file, step) => {
  const currentIndex = collaboratorFiles.indexOf(file)
  if (currentIndex < 0) return file
  return collaboratorFiles[(currentIndex + step + collaboratorFiles.length) % collaboratorFiles.length]
}

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
  const [slideDirection, setSlideDirection] = useState('next')
  const previewSwipeRef = useRef({ active: false, pointerId: null, startX: 0, deltaX: 0 })
  const firstRow = collaboratorFiles.filter((_, index) => index % 2 === 0)
  const secondRow = collaboratorFiles.filter((_, index) => index % 2 === 1)

  const moveLogo = (step) => {
    setSlideDirection(step > 0 ? 'next' : 'prev')
    setSelectedLogo((current) => adjacentLogo(current, step))
  }

  useEffect(() => {
    if (!selectedLogo) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedLogo(null)
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setSlideDirection('prev')
        setSelectedLogo((current) => adjacentLogo(current, -1))
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setSlideDirection('next')
        setSelectedLogo((current) => adjacentLogo(current, 1))
      }
    }

    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [selectedLogo])

  const startPreviewSwipe = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    previewSwipeRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      deltaX: 0,
    }

    event.currentTarget.classList.add('is-swiping')
    event.currentTarget.style.setProperty('--preview-drag-x', '0px')

    try {
      event.currentTarget.setPointerCapture?.(event.pointerId)
    } catch {
      // Pointer capture is optional; swipe still works without it.
    }
  }

  const movePreviewSwipe = (event) => {
    const swipe = previewSwipeRef.current
    if (!swipe.active || swipe.pointerId !== event.pointerId) return

    const deltaX = event.clientX - swipe.startX
    swipe.deltaX = deltaX
    event.currentTarget.style.setProperty('--preview-drag-x', `${Math.max(-110, Math.min(110, deltaX))}px`)
  }

  const finishPreviewSwipe = (event) => {
    const swipe = previewSwipeRef.current
    if (!swipe.active || swipe.pointerId !== event.pointerId) return

    const deltaX = swipe.deltaX

    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }
    } catch {
      // Browser may already have released pointer capture.
    }

    event.currentTarget.classList.remove('is-swiping')
    event.currentTarget.style.setProperty('--preview-drag-x', '0px')
    previewSwipeRef.current = { active: false, pointerId: null, startX: 0, deltaX: 0 }

    if (Math.abs(deltaX) < 55) return
    moveLogo(deltaX < 0 ? 1 : -1)
  }

  return (
    <>
      <style>{`
        .collab-lightbox {
          padding: clamp(16px, 2.8vw, 34px) !important;
          background:
            radial-gradient(circle at 50% 38%, rgba(111, 151, 128, .18), transparent 32%),
            linear-gradient(145deg, rgba(5, 29, 21, .88), rgba(13, 48, 36, .80)) !important;
          backdrop-filter: blur(20px) saturate(.9) !important;
          -webkit-backdrop-filter: blur(20px) saturate(.9) !important;
        }

        .collab-lightbox__panel {
          width: min(960px, 100%) !important;
          overflow: hidden !important;
          border: 1px solid rgba(199, 221, 207, .22) !important;
          border-radius: 30px !important;
          background: #123c2f !important;
          box-shadow:
            0 48px 130px rgba(1, 17, 11, .42),
            0 12px 34px rgba(1, 20, 13, .20),
            inset 0 1px 0 rgba(255,255,255,.09) !important;
        }

        .collab-lightbox__head {
          min-height: 106px !important;
          padding: 24px 30px 22px !important;
          border-bottom: 1px solid rgba(223, 236, 227, .10) !important;
          background:
            radial-gradient(circle at 15% 0%, rgba(255,255,255,.06), transparent 32%),
            linear-gradient(105deg, #143f32 0%, #0f3529 100%) !important;
        }

        .collab-lightbox__head span {
          color: rgba(205, 224, 212, .63) !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          letter-spacing: .21em !important;
        }

        .collab-lightbox__head strong {
          color: #f4f7f3 !important;
          font-size: clamp(28px, 3.1vw, 36px) !important;
          font-weight: 650 !important;
          letter-spacing: -.035em !important;
        }

        .collab-lightbox__close {
          width: 50px !important;
          height: 50px !important;
          border: 1px solid rgba(222, 236, 227, .17) !important;
          background: rgba(255,255,255,.055) !important;
          color: #e9f2ec !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.07) !important;
        }

        .collab-lightbox__close:hover {
          border-color: rgba(222, 236, 227, .30) !important;
          background: rgba(255,255,255,.11) !important;
        }

        .collab-lightbox__visual {
          --preview-drag-x: 0px;
          position: relative !important;
          isolation: isolate !important;
          min-height: 500px !important;
          display: grid !important;
          place-items: center !important;
          overflow: hidden !important;
          padding: 48px 104px 56px !important;
          cursor: grab !important;
          touch-action: pan-y !important;
          user-select: none !important;
          background:
            radial-gradient(circle at 50% 46%, rgba(239, 229, 199, .50), transparent 29%),
            radial-gradient(circle at 78% 18%, rgba(70, 113, 91, .16), transparent 35%),
            linear-gradient(135deg, #ced8d0 0%, #dfe3da 45%, #c8d5cc 100%) !important;
        }

        .collab-lightbox__visual::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(180deg, rgba(255,255,255,.08), transparent 26%, transparent 74%, rgba(20,55,41,.08)),
            radial-gradient(ellipse at center, transparent 45%, rgba(21,58,44,.09) 100%);
        }

        .collab-lightbox__visual.is-swiping {
          cursor: grabbing !important;
        }

        .collab-lightbox__logo-wrap {
          position: relative !important;
          z-index: 2 !important;
          width: min(720px, 80vw) !important;
          min-height: 320px !important;
          display: grid !important;
          place-items: center !important;
          transform: translateX(var(--preview-drag-x)) !important;
          transition: transform .28s cubic-bezier(.22,1,.36,1), opacity .28s ease !important;
          will-change: transform;
        }

        .collab-lightbox__visual.is-swiping .collab-lightbox__logo-wrap {
          transition: none !important;
        }

        .collab-lightbox__logo-wrap.slide--next {
          animation: collab-premium-slide-next .38s cubic-bezier(.22,1,.36,1) both;
        }

        .collab-lightbox__logo-wrap.slide--prev {
          animation: collab-premium-slide-prev .38s cubic-bezier(.22,1,.36,1) both;
        }

        .collab-lightbox__visual img {
          display: block !important;
          width: min(680px, 76vw) !important;
          max-width: 100% !important;
          max-height: 350px !important;
          height: auto !important;
          object-fit: contain !important;
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          filter:
            saturate(1.04)
            contrast(1.035)
            drop-shadow(0 18px 34px rgba(17, 57, 42, .12)) !important;
          animation: none !important;
        }

        .collab-lightbox__nav {
          z-index: 5 !important;
          width: 56px !important;
          height: 56px !important;
          border: 1px solid rgba(235, 244, 238, .24) !important;
          background: rgba(18, 60, 47, .88) !important;
          color: #f2f7f3 !important;
          box-shadow: 0 14px 34px rgba(19, 63, 46, .18) !important;
          backdrop-filter: blur(14px) !important;
          -webkit-backdrop-filter: blur(14px) !important;
        }

        .collab-lightbox__nav:hover,
        .collab-lightbox__nav:focus-visible {
          border-color: rgba(255,255,255,.40) !important;
          background: #175747 !important;
          box-shadow: 0 17px 38px rgba(12, 49, 36, .25) !important;
        }

        .collab-lightbox__nav--prev { left: 28px !important; }
        .collab-lightbox__nav--next { right: 28px !important; }

        .collab-lightbox__swipe-hint {
          position: absolute;
          z-index: 4;
          left: 50%;
          bottom: 18px;
          transform: translateX(-50%);
          color: rgba(24, 67, 51, .58);
          font-size: 9px;
          font-weight: 750;
          letter-spacing: .16em;
          text-transform: uppercase;
          pointer-events: none;
        }

        @keyframes collab-premium-slide-next {
          from { opacity: .35; transform: translateX(54px) scale(.985); }
          to { opacity: 1; transform: translateX(var(--preview-drag-x)) scale(1); }
        }

        @keyframes collab-premium-slide-prev {
          from { opacity: .35; transform: translateX(-54px) scale(.985); }
          to { opacity: 1; transform: translateX(var(--preview-drag-x)) scale(1); }
        }

        @media (max-width: 700px) {
          .collab-lightbox__panel { border-radius: 22px !important; }
          .collab-lightbox__head { min-height: 86px !important; padding: 18px 18px 16px !important; }
          .collab-lightbox__head strong { font-size: clamp(23px, 7vw, 30px) !important; }
          .collab-lightbox__close { width: 42px !important; height: 42px !important; }
          .collab-lightbox__visual { min-height: 350px !important; padding: 38px 58px 46px !important; }
          .collab-lightbox__logo-wrap { width: min(520px, 82vw) !important; min-height: 230px !important; }
          .collab-lightbox__visual img { width: min(500px, 78vw) !important; max-height: 245px !important; }
          .collab-lightbox__nav { width: 44px !important; height: 44px !important; }
          .collab-lightbox__nav--prev { left: 10px !important; }
          .collab-lightbox__nav--next { right: 10px !important; }
          .collab-lightbox__swipe-hint { bottom: 13px; font-size: 8px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .collab-lightbox__logo-wrap { animation: none !important; transition: none !important; }
        }
      `}</style>

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
            onOpen={(file) => { setSlideDirection('next'); setSelectedLogo(file) }}
            speed={30}
          />
          <DraggableRow
            files={secondRow}
            label="Collaborators row two"
            onOpen={(file) => { setSlideDirection('next'); setSelectedLogo(file) }}
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

            <div
              className="collab-lightbox__visual"
              onPointerDown={startPreviewSwipe}
              onPointerMove={movePreviewSwipe}
              onPointerUp={finishPreviewSwipe}
              onPointerCancel={finishPreviewSwipe}
            >
              <button
                type="button"
                className="collab-lightbox__nav collab-lightbox__nav--prev"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => moveLogo(-1)}
                aria-label="Previous collaborator"
              >
                <span aria-hidden="true">←</span>
              </button>

              <div key={selectedLogo} className={`collab-lightbox__logo-wrap slide--${slideDirection}`}>
                <img
                  src={asset(`collabolator brutti/${selectedLogo}`)}
                  alt={`${displayName(selectedLogo)} logo enlarged`}
                />
              </div>

              <button
                type="button"
                className="collab-lightbox__nav collab-lightbox__nav--next"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => moveLogo(1)}
                aria-label="Next collaborator"
              >
                <span aria-hidden="true">→</span>
              </button>

              <span className="collab-lightbox__swipe-hint">Swipe to explore</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Collaborators