import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
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

const ReportPage = forwardRef(function ReportPage({ page }, ref) {
  const isCover = page === 1 || page === TOTAL_PAGES

  return (
    <div
      className={`impact-flip-page${isCover ? ' impact-flip-page--cover' : ''}`}
      ref={ref}
      data-density={isCover ? 'hard' : 'soft'}
    >
      <img
        src={pageImage(page)}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
      />
    </div>
  )
})

export default function ImpactReportPage() {
  const readerRef = useRef(null)
  const bookRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const onKeyDown = (event) => {
      const pageFlip = bookRef.current?.pageFlip?.()
      if (!pageFlip || isFlipping) return

      if (event.key === 'ArrowRight') pageFlip.flipNext()
      if (event.key === 'ArrowLeft') pageFlip.flipPrev()
      if (event.key === 'Escape' && document.fullscreenElement) document.exitFullscreen?.()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFlipping])

  useEffect(() => {
    const preload = (page) => {
      if (page < 1 || page > TOTAL_PAGES) return
      const image = new Image()
      image.src = pageImage(page)
    }

    ;[currentPage - 3, currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2, currentPage + 3]
      .forEach(preload)
  }, [currentPage])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await readerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      // Keep the reader usable even when browser fullscreen is unavailable.
    }
  }

  const previousPage = () => {
    if (isFlipping) return
    bookRef.current?.pageFlip?.()?.flipPrev('top')
  }

  const nextPage = () => {
    if (isFlipping) return
    bookRef.current?.pageFlip?.()?.flipNext('top')
  }

  const jumpToPage = (page) => {
    if (isFlipping) return
    const target = Math.max(1, Math.min(TOTAL_PAGES, Number(page)))
    bookRef.current?.pageFlip?.()?.turnToPage(target - 1)
    setCurrentPage(target)
  }

  const pageLabel = useMemo(() => {
    if (currentPage <= 1 || currentPage >= TOTAL_PAGES) return `${currentPage} / ${TOTAL_PAGES}`

    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1
    const right = Math.min(TOTAL_PAGES, left + 1)
    return `${left}–${right} / ${TOTAL_PAGES}`
  }, [currentPage])

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
              <span>Interactive digital edition</span>
            </div>
          </div>

          <div className={`impact-report-reader${isFlipping ? ' is-flipping' : ''}`} ref={readerRef}>
            <div className="impact-report-reader__toolbar">
              <div className="impact-report-reader__title">
                <span className="impact-report-reader__dot" />
                <strong>Brutti Impact Report 2026</strong>
              </div>

              <div className="impact-report-reader__actions">
                {zoom !== 1 && (
                  <button onClick={() => setZoom(1)} aria-label="Reset zoom" title="Reset zoom">
                    <RotateCcw size={15} />
                    <span>Reset</span>
                  </button>
                )}
                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                  {isFullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
                  <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
                </button>
              </div>
            </div>

            <div className="impact-report-reader__stage">
              <button
                className="impact-report-reader__edge impact-report-reader__edge--left"
                onClick={previousPage}
                disabled={currentPage <= 1 || isFlipping}
                aria-label="Previous page"
              >
                <ChevronLeft size={28} />
              </button>

              <div className={`impact-report-reader__viewport${zoom > 1 ? ' is-zoomed' : ''}`}>
                <div className="impact-report-reader__zoom" style={{ '--impact-zoom': zoom }}>
                  <div className="impact-report-reader__book-wrap">
                    <HTMLFlipBook
                      ref={bookRef}
                      width={447}
                      height={632}
                      size="stretch"
                      minWidth={275}
                      maxWidth={500}
                      minHeight={389}
                      maxHeight={707}
                      startPage={0}
                      drawShadow
                      flippingTime={1050}
                      usePortrait
                      startZIndex={10}
                      autoSize
                      maxShadowOpacity={0.34}
                      showCover
                      mobileScrollSupport
                      clickEventForward={false}
                      useMouseEvents
                      swipeDistance={28}
                      showPageCorners
                      disableFlipByClick={false}
                      className="impact-html-flipbook"
                      onFlip={(event) => setCurrentPage(event.data + 1)}
                      onChangeState={(event) => setIsFlipping(event.data === 'flipping')}
                    >
                      {Array.from({ length: TOTAL_PAGES }, (_, index) => (
                        <ReportPage page={index + 1} key={index + 1} />
                      ))}
                    </HTMLFlipBook>
                  </div>
                </div>
              </div>

              <button
                className="impact-report-reader__edge impact-report-reader__edge--right"
                onClick={nextPage}
                disabled={currentPage >= TOTAL_PAGES || isFlipping}
                aria-label="Next page"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            <div className="impact-report-reader__controls">
              <button onClick={previousPage} disabled={currentPage <= 1 || isFlipping} aria-label="Previous page">
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
                  onClick={() => setZoom((value) => Math.max(0.9, Number((value - 0.1).toFixed(2))))}
                  disabled={zoom <= 0.9}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(2))))}
                  disabled={zoom >= 1.4}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              <button onClick={nextPage} disabled={currentPage >= TOTAL_PAGES || isFlipping} aria-label="Next page">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <p className="impact-report-reader__hint">
            Drag a page corner to turn it like a real book, tap the page edge, or use the arrows. On mobile, swipe left or right.
          </p>
        </div>
      </section>
    </main>
  )
}
