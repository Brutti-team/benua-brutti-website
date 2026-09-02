import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

const TOTAL_PAGES = 40

function backHome() {
  window.location.href = '/'
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function normalizeDesktopPage(page) {
  if (page <= 1) return 1
  if (page >= TOTAL_PAGES) return TOTAL_PAGES
  return page % 2 === 0 ? page : page - 1
}

export default function ImpactReportPage() {
  const readerRef = useRef(null)
  const touchStartX = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 760px)').matches)
  const [currentPage, setCurrentPage] = useState(1)
  const [direction, setDirection] = useState(1)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)')
    const onChange = (event) => {
      setIsMobile(event.matches)
      if (!event.matches) {
        setCurrentPage((page) => normalizeDesktopPage(page))
      }
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const nextPage = () => {
    if (currentPage >= TOTAL_PAGES) return
    setDirection(1)

    if (isMobile) {
      setCurrentPage((page) => Math.min(TOTAL_PAGES, page + 1))
      return
    }

    if (currentPage === 1) setCurrentPage(2)
    else if (currentPage >= 38) setCurrentPage(40)
    else setCurrentPage((page) => page + 2)
  }

  const previousPage = () => {
    if (currentPage <= 1) return
    setDirection(-1)

    if (isMobile) {
      setCurrentPage((page) => Math.max(1, page - 1))
      return
    }

    if (currentPage === 40) setCurrentPage(38)
    else if (currentPage <= 2) setCurrentPage(1)
    else setCurrentPage((page) => page - 2)
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') nextPage()
      if (event.key === 'ArrowLeft') previousPage()
      if (event.key === 'Escape' && document.fullscreenElement) document.exitFullscreen?.()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  })

  useEffect(() => {
    const pagesToPreload = new Set([
      currentPage,
      Math.max(1, currentPage - 2),
      Math.max(1, currentPage - 1),
      Math.min(TOTAL_PAGES, currentPage + 1),
      Math.min(TOTAL_PAGES, currentPage + 2),
    ])

    pagesToPreload.forEach((page) => {
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [currentPage])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await readerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      // Keep the reader usable even if fullscreen is blocked by the browser.
    }
  }

  const jumpToPage = (page) => {
    const target = Number(page)
    setDirection(target >= currentPage ? 1 : -1)
    setCurrentPage(isMobile ? target : normalizeDesktopPage(target))
  }

  const visiblePages = isMobile
    ? [currentPage]
    : currentPage === 1 || currentPage === TOTAL_PAGES
      ? [currentPage]
      : [currentPage, Math.min(TOTAL_PAGES, currentPage + 1)]

  const pageLabel = visiblePages.length === 1
    ? `${visiblePages[0]} / ${TOTAL_PAGES}`
    : `${visiblePages[0]}–${visiblePages[1]} / ${TOTAL_PAGES}`

  return (
    <main className="impact-report-page">
      <header className="impact-report-nav">
        <button className="impact-report-nav__brand" onClick={backHome} aria-label="Back to Benua Brutti home">
          <img src={`${import.meta.env.BASE_URL}assets/logo-brutti-white.png`} alt="Benua Brutti" />
        </button>

        <button className="impact-report-nav__back" onClick={backHome}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <section className="impact-report-viewer-section">
        <div className="impact-report-shell">
          <div className="impact-report-heading">
            <div>
              <p className="impact-report-kicker">Impact Report · 2026</p>
              <h1>Our impact,<br /><em>page by page.</em></h1>
            </div>

            <div className="impact-report-heading__copy">
              <p>
                Explore Brutti's story, growth, people, milestones and impact through our complete 40-page digital report.
              </p>
              <span>Self-hosted digital edition</span>
            </div>
          </div>

          <div className="impact-report-reader" ref={readerRef}>
            <div className="impact-report-reader__toolbar">
              <div>
                <span className="impact-report-reader__dot" />
                <strong>Brutti Impact Report 2026</strong>
              </div>

              <div className="impact-report-reader__actions">
                <button onClick={() => setZoom(1)} aria-label="Reset zoom" title="Reset zoom">
                  <RotateCcw size={16} />
                  <span>Reset</span>
                </button>
                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                  {isFullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
                  <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
                </button>
              </div>
            </div>

            <div
              className="impact-report-reader__stage"
              onTouchStart={(event) => {
                touchStartX.current = event.touches[0]?.clientX ?? null
              }}
              onTouchEnd={(event) => {
                if (touchStartX.current == null) return
                const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
                const delta = endX - touchStartX.current
                touchStartX.current = null

                if (Math.abs(delta) < 45) return
                if (delta < 0) nextPage()
                else previousPage()
              }}
            >
              <button
                className="impact-report-reader__edge impact-report-reader__edge--left"
                onClick={previousPage}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={30} />
              </button>

              <div className="impact-report-reader__viewport">
                <div className="impact-report-reader__zoom" style={{ '--impact-zoom': zoom }}>
                  <AnimatePresence mode="wait" initial={false} custom={direction}>
                    <motion.div
                      className={`impact-book ${visiblePages.length === 1 ? 'impact-book--single' : ''}`}
                      key={`${isMobile ? 'mobile' : 'desktop'}-${currentPage}`}
                      custom={direction}
                      initial={{ opacity: 0.82, x: direction > 0 ? 34 : -34, rotateY: direction > 0 ? -5 : 5 }}
                      animate={{ opacity: 1, x: 0, rotateY: 0 }}
                      exit={{ opacity: 0.78, x: direction > 0 ? -26 : 26, rotateY: direction > 0 ? 4 : -4 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {visiblePages.map((page, index) => (
                        <figure
                          className={`impact-book__page ${visiblePages.length > 1 && index === 0 ? 'impact-book__page--left' : ''} ${visiblePages.length > 1 && index === 1 ? 'impact-book__page--right' : ''}`}
                          key={page}
                        >
                          <img
                            src={pageImage(page)}
                            alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
                            draggable="false"
                          />
                          <figcaption>{page}</figcaption>
                        </figure>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <button
                className="impact-report-reader__edge impact-report-reader__edge--right"
                onClick={nextPage}
                disabled={currentPage === TOTAL_PAGES}
                aria-label="Next page"
              >
                <ChevronRight size={30} />
              </button>
            </div>

            <div className="impact-report-reader__controls">
              <button onClick={previousPage} disabled={currentPage === 1} aria-label="Previous page">
                <ChevronLeft size={18} />
              </button>

              <strong>{pageLabel}</strong>

              <input
                aria-label="Jump to page"
                type="range"
                min="1"
                max={TOTAL_PAGES}
                value={currentPage}
                onChange={(event) => jumpToPage(event.target.value)}
              />

              <div className="impact-report-reader__zoom-controls">
                <button
                  onClick={() => setZoom((value) => Math.max(0.85, Number((value - 0.15).toFixed(2))))}
                  disabled={zoom <= 0.85}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={17} />
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.15).toFixed(2))))}
                  disabled={zoom >= 1.6}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={17} />
                </button>
              </div>

              <button onClick={nextPage} disabled={currentPage === TOTAL_PAGES} aria-label="Next page">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <p className="impact-report-reader__hint">
            Use the arrows or keyboard to turn pages. On mobile, swipe left or right. The report is hosted directly on Brutti's website with no third-party watermark.
          </p>
        </div>
      </section>
    </main>
  )
}
