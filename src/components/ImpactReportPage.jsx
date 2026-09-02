import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Minimize2,
} from 'lucide-react'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`
const TOTAL_PAGES = 40
const PAGES_PER_SPRITE = 8

function backHome() {
  window.location.href = '/'
}

function getPageStyle(pageNumber) {
  if (!pageNumber) return undefined

  const zeroBased = pageNumber - 1
  const sprite = Math.floor(zeroBased / PAGES_PER_SPRITE) + 1
  const withinSprite = zeroBased % PAGES_PER_SPRITE
  const position = (withinSprite / (PAGES_PER_SPRITE - 1)) * 100

  return {
    backgroundImage: `url("${asset(`impact-pages-${sprite}.webp`)}")`,
    backgroundSize: `100% ${PAGES_PER_SPRITE * 100}%`,
    backgroundPosition: `center ${position}%`,
    backgroundRepeat: 'no-repeat',
  }
}

function ReportPage({ pageNumber, className = '' }) {
  if (!pageNumber) {
    return <div className={`impact-book-page impact-book-page--empty ${className}`} aria-hidden="true" />
  }

  return (
    <div
      className={`impact-book-page ${className}`}
      style={getPageStyle(pageNumber)}
      role="img"
      aria-label={`Brutti Impact Report 2026, page ${pageNumber}`}
    />
  )
}

export default function ImpactReportPage() {
  const [page, setPage] = useState(1)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 820px)').matches)
  const [turning, setTurning] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const readerRef = useRef(null)
  const touchStartX = useRef(null)
  const turnTimer = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 820px)')
    const onChange = (event) => setIsMobile(event.matches)
    media.addEventListener?.('change', onChange)
    return () => media.removeEventListener?.('change', onChange)
  }, [])

  useEffect(() => {
    if (!isMobile && page > 1 && page % 2 === 1) {
      setPage(page - 1)
    }
  }, [isMobile, page])

  useEffect(() => {
    const preload = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > TOTAL_PAGES) return
      const sprite = Math.floor((pageNumber - 1) / PAGES_PER_SPRITE) + 1
      const image = new Image()
      image.src = asset(`impact-pages-${sprite}.webp`)
    }

    preload(page)
    preload(page + (isMobile ? 1 : 2))
    preload(page - (isMobile ? 1 : 2))
  }, [page, isMobile])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => () => clearTimeout(turnTimer.current), [])

  const desktopLeft = page === 1 ? null : page
  const desktopRight = page === 1 ? 1 : page < TOTAL_PAGES ? page + 1 : null
  const currentLabel = isMobile
    ? `Page ${page} of ${TOTAL_PAGES}`
    : page === 1
      ? `Cover · 1 of ${TOTAL_PAGES}`
      : desktopRight
        ? `Pages ${desktopLeft}–${desktopRight} of ${TOTAL_PAGES}`
        : `Page ${desktopLeft} of ${TOTAL_PAGES}`

  const nextTarget = () => {
    if (isMobile) return Math.min(page + 1, TOTAL_PAGES)
    if (page === 1) return 2
    return Math.min(page + 2, TOTAL_PAGES)
  }

  const prevTarget = () => {
    if (isMobile) return Math.max(page - 1, 1)
    if (page === 2) return 1
    return Math.max(page - 2, 1)
  }

  const turnTo = (target, direction) => {
    if (turning || target === page || target < 1 || target > TOTAL_PAGES) return

    const oldPage = page
    const frontPage = isMobile
      ? oldPage
      : direction === 'next'
        ? (oldPage === 1 ? 1 : Math.min(oldPage + 1, TOTAL_PAGES))
        : oldPage

    const backPage = isMobile
      ? target
      : direction === 'next'
        ? target
        : target === 1
          ? 1
          : Math.min(target + 1, TOTAL_PAGES)

    setTurning({ direction, frontPage, backPage })
    setPage(target)

    clearTimeout(turnTimer.current)
    turnTimer.current = setTimeout(() => setTurning(null), 760)
  }

  const next = () => {
    if (page >= TOTAL_PAGES) return
    turnTo(nextTarget(), 'next')
  }

  const prev = () => {
    if (page <= 1) return
    turnTo(prevTarget(), 'prev')
  }

  const jumpTo = (rawPage) => {
    let target = Number(rawPage)
    if (!isMobile && target > 1 && target % 2 === 1) target -= 1
    target = Math.min(Math.max(target, 1), TOTAL_PAGES)
    if (target === page) return
    turnTo(target, target > page ? 'next' : 'prev')
  }

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await readerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      // Fullscreen is optional; the reader remains fully usable without it.
    }
  }

  const onTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event) => {
    if (touchStartX.current == null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const delta = endX - touchStartX.current
    touchStartX.current = null

    if (Math.abs(delta) < 55) return
    if (delta < 0) next()
    else prev()
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  return (
    <main className="impact-report-page">
      <header className="impact-report-nav">
        <button className="impact-report-nav__brand" onClick={backHome} aria-label="Back to Benua Brutti home">
          <img src={asset('logo-brutti-white.png')} alt="Benua Brutti" />
        </button>
        <button className="impact-report-nav__back" onClick={backHome}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <section className="impact-report-hero">
        <div className="impact-report-shell impact-report-hero__grid">
          <motion.div
            className="impact-report-hero__copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="impact-report-kicker">Impact Report · 2026</p>
            <h1>Our impact,<br /><em>page by page.</em></h1>
            <p className="impact-report-intro">
              Explore Brutti’s 2026 impact report as an interactive digital book. Flip through our story, growth, people, milestones and the work behind every second life we create.
            </p>
          </motion.div>

          <motion.div
            className="impact-report-hero__cover-preview"
            initial={{ opacity: 0, y: 28, rotate: 1.2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReportPage pageNumber={1} />
          </motion.div>
        </div>
      </section>

      <section className="impact-reader-section" aria-label="Brutti Impact Report 2026 digital flipbook">
        <div className="impact-report-shell">
          <div className="impact-reader-head">
            <div>
              <p className="impact-report-kicker">Digital edition</p>
              <h2>Flip through the full report.</h2>
            </div>
            <p>Use the arrows, keyboard, page slider or swipe on mobile.</p>
          </div>

          <div className="impact-flipbook" ref={readerRef}>
            <div className="impact-flipbook__toolbar">
              <span>{currentLabel}</span>
              <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                {isFullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
                <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
              </button>
            </div>

            <div
              className={`impact-flipbook__stage ${isMobile ? 'is-mobile' : ''}`}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              <button
                className="impact-flipbook__edge impact-flipbook__edge--prev"
                onClick={prev}
                disabled={page <= 1 || Boolean(turning)}
                aria-label="Previous page"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="impact-flipbook__book">
                {isMobile ? (
                  <ReportPage pageNumber={page} className="impact-book-page--mobile" />
                ) : (
                  <>
                    <ReportPage pageNumber={desktopLeft} className="impact-book-page--left" />
                    <ReportPage pageNumber={desktopRight} className="impact-book-page--right" />
                  </>
                )}

                {turning && (
                  <div className={`impact-flip-sheet impact-flip-sheet--${turning.direction} ${isMobile ? 'is-mobile' : ''}`}>
                    <ReportPage pageNumber={turning.frontPage} className="impact-flip-sheet__face impact-flip-sheet__front" />
                    <ReportPage pageNumber={turning.backPage} className="impact-flip-sheet__face impact-flip-sheet__back" />
                  </div>
                )}
              </div>

              <button
                className="impact-flipbook__edge impact-flipbook__edge--next"
                onClick={next}
                disabled={page >= TOTAL_PAGES || Boolean(turning)}
                aria-label="Next page"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            <div className="impact-flipbook__controls">
              <button onClick={prev} disabled={page <= 1 || Boolean(turning)}>
                <ChevronLeft size={18} /> Previous
              </button>

              <div className="impact-flipbook__progress">
                <input
                  type="range"
                  min="1"
                  max={TOTAL_PAGES}
                  value={isMobile ? page : (desktopRight || desktopLeft || 1)}
                  onChange={(event) => jumpTo(event.target.value)}
                  aria-label="Jump to report page"
                />
                <span>{isMobile ? page : (desktopRight || desktopLeft || 1)} / {TOTAL_PAGES}</span>
              </div>

              <button onClick={next} disabled={page >= TOTAL_PAGES || Boolean(turning)}>
                Next <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-report-summary">
        <div className="impact-report-shell">
          <div className="impact-report-summary__head">
            <p className="impact-report-kicker">Impact at a glance</p>
            <h2>Turning waste into something worth keeping.</h2>
          </div>

          <div className="impact-report-metrics">
            <article>
              <strong>57</strong>
              <span>Tonnes of pallet wood</span>
              <b>RESCUED</b>
            </article>
            <article>
              <strong>600</strong>
              <span>Trees being</span>
              <b>SAVED</b>
            </article>
          </div>

          <button className="impact-report-home" onClick={backHome}>
            <ArrowLeft size={17} /> Return to Benua Brutti
          </button>
        </div>
      </section>
    </main>
  )
}
