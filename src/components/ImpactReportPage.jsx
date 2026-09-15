import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-tweaks.css'
import '../impact-report-nav-home.css'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Expand,
  Minimize2,
  RotateCcw,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

const TOTAL_PAGES = 40

// Public-domain recording: "Turning a page.ogg" by planish, hosted on Wikimedia Commons.
const PAPER_SOUND_URL = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Turning_a_page.ogg'

const MOBILE_READER_CONSISTENCY_CSS = `
@media (max-width: 700px) {
  .impact-report-page .impact-report-reader__actions,
  .impact-report-page .impact-report-reader__actions button {
    position: relative !important;
    z-index: 80 !important;
    pointer-events: auto !important;
  }

  .impact-report-page .impact-report-reader__actions button {
    touch-action: manipulation !important;
    -webkit-tap-highlight-color: transparent !important;
  }

  .impact-report-page .impact-report-reader__zoom,
  .impact-report-page .impact-report-reader__book-wrap,
  .impact-report-page .impact-report-reader__book-wrap.is-front-cover,
  .impact-report-page .impact-report-reader__book-wrap.is-back-cover {
    width: 100% !important;
    height: clamp(351px, 120vw, 475px) !important;
    min-height: 351px !important;
    max-height: 475px !important;
    transform: none !important;
    transition: none !important;
  }

  .impact-report-page .impact-html-flipbook {
    margin: 0 auto !important;
    touch-action: pan-y !important;
    filter: drop-shadow(0 14px 18px rgba(0, 0, 0, 0.23)) !important;
  }

  .impact-report-page .impact-flip-page img {
    object-fit: contain !important;
    background: #fff !important;
  }

  .impact-report-reader.is-mobile-expanded {
    position: fixed !important;
    inset: 0 !important;
    z-index: 10000 !important;
    width: 100vw !important;
    height: 100dvh !important;
    display: grid !important;
    grid-template-rows: 50px minmax(0, 1fr) 48px !important;
    overflow: hidden !important;
    border: 0 !important;
    border-radius: 0 !important;
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
    background: #0b3329 !important;
  }

  .impact-report-reader.is-mobile-expanded .impact-report-reader__toolbar {
    position: relative !important;
    z-index: 100 !important;
    min-height: 50px !important;
  }

  .impact-report-reader.is-mobile-expanded .impact-report-reader__stage {
    min-height: 0 !important;
    height: 100% !important;
    overflow: hidden !important;
  }

  .impact-report-reader.is-mobile-expanded .impact-report-reader__viewport {
    min-height: 0 !important;
    height: 100% !important;
    padding: 8px 0 10px !important;
    overflow: hidden !important;
  }

  .impact-report-reader.is-mobile-expanded .impact-report-reader__zoom,
  .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap,
  .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap.is-front-cover,
  .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap.is-back-cover {
    height: min(calc(100dvh - 118px), 537px) !important;
    min-height: min(351px, calc(100dvh - 118px)) !important;
    max-height: 537px !important;
  }

  .impact-report-reader.is-mobile-expanded .impact-report-reader__controls {
    min-height: 48px !important;
    position: relative !important;
    z-index: 100 !important;
  }
}

@supports not (height: 100dvh) {
  @media (max-width: 700px) {
    .impact-report-reader.is-mobile-expanded {
      height: 100vh !important;
    }

    .impact-report-reader.is-mobile-expanded .impact-report-reader__zoom,
    .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap,
    .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap.is-front-cover,
    .impact-report-reader.is-mobile-expanded .impact-report-reader__book-wrap.is-back-cover {
      height: min(calc(100vh - 118px), 537px) !important;
    }
  }
}
`

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
  const paperAudioRef = useRef(null)
  const paperAudioStopTimerRef = useRef(null)
  const lastPaperSoundAt = useRef(0)
  const paperGestureSoundPlayedRef = useRef(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [isMobileReader, setIsMobileReader] = useState(false)

  const readerExpanded = isFullscreen || isMobileExpanded

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(max-width: 700px)')
    const sync = () => setIsMobileReader(media.matches)
    sync()
    media.addEventListener?.('change', sync)
    return () => media.removeEventListener?.('change', sync)
  }, [])

  useEffect(() => {
    if (!isMobileReader && isMobileExpanded) {
      setIsMobileExpanded(false)
    }
  }, [isMobileReader, isMobileExpanded])

  useEffect(() => {
    if (!isMobileExpanded) return undefined

    const bodyOverflow = document.body.style.overflow
    const htmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = bodyOverflow
      document.documentElement.style.overflow = htmlOverflow
    }
  }, [isMobileExpanded])

  useEffect(() => {
    const audio = new Audio(PAPER_SOUND_URL)
    audio.preload = 'auto'
    audio.volume = 1
    audio.playbackRate = 2.55

    if ('preservesPitch' in audio) {
      audio.preservesPitch = true
    }

    paperAudioRef.current = audio

    return () => {
      if (paperAudioStopTimerRef.current) {
        window.clearTimeout(paperAudioStopTimerRef.current)
      }

      audio.pause()
      audio.currentTime = 0
      paperAudioRef.current = null
    }
  }, [])

  const playPaperSound = () => {
    if (!soundEnabled) return

    const timestamp = performance.now()
    if (timestamp - lastPaperSoundAt.current < 300) return
    lastPaperSoundAt.current = timestamp

    const audio = paperAudioRef.current
    if (!audio) return

    if (paperAudioStopTimerRef.current) {
      window.clearTimeout(paperAudioStopTimerRef.current)
    }

    audio.pause()
    audio.currentTime = 0
    audio.volume = 1
    audio.playbackRate = 2.55

    if ('preservesPitch' in audio) {
      audio.preservesPitch = true
    }

    const playback = audio.play()
    playback?.catch(() => {})

    paperAudioStopTimerRef.current = window.setTimeout(() => {
      audio.pause()
      audio.currentTime = 0
    }, 1350)
  }

  const toggleSound = () => {
    setSoundEnabled((enabled) => {
      const next = !enabled

      if (!next && paperAudioRef.current) {
        paperAudioRef.current.pause()
        paperAudioRef.current.currentTime = 0
      }

      return next
    })
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isMobileExpanded) {
          setIsMobileExpanded(false)
          return
        }

        if (document.fullscreenElement) {
          document.exitFullscreen?.()
          return
        }
      }

      const pageFlip = bookRef.current?.pageFlip?.()
      if (!pageFlip || isFlipping) return

      if (event.key === 'ArrowRight') pageFlip.flipNext('top')
      if (event.key === 'ArrowLeft') pageFlip.flipPrev('top')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isFlipping, isMobileExpanded])

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
    if (isMobileReader) {
      setIsMobileExpanded((expanded) => !expanded)
      return
    }

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
    const target = Math.max(1, Math.min(TOTAL_PAGES, Number(page)))
    if (isFlipping) return
    bookRef.current?.pageFlip?.()?.turnToPage(target - 1)
    setCurrentPage(target)
  }

  const pageLabel = useMemo(() => {
    if (isMobileReader) return `${currentPage} / ${TOTAL_PAGES}`
    if (currentPage <= 1 || currentPage >= TOTAL_PAGES) return `${currentPage} / ${TOTAL_PAGES}`

    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1
    const right = Math.min(TOTAL_PAGES, left + 1)
    return `${left}–${right} / ${TOTAL_PAGES}`
  }, [currentPage, isMobileReader])

  const bookPositionClass = !isFlipping && currentPage === 1
    ? ' is-front-cover'
    : !isFlipping && currentPage >= TOTAL_PAGES
      ? ' is-back-cover'
      : ''

  const mobileBookMaxWidth = isMobileExpanded ? 380 : 336
  const mobileBookMaxHeight = isMobileExpanded ? 537 : 475

  return (
    <main className="impact-report-page">
      <style>{MOBILE_READER_CONSISTENCY_CSS}</style>

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

          <div
            className={`impact-report-reader${isFlipping ? ' is-flipping' : ''}${isMobileExpanded ? ' is-mobile-expanded' : ''}`}
            ref={readerRef}
          >
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
                <button
                  onClick={toggleSound}
                  aria-label={soundEnabled ? 'Mute page sound' : 'Enable page sound'}
                  title={soundEnabled ? 'Page sound on' : 'Page sound off'}
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  <span>{soundEnabled ? 'Sound' : 'Muted'}</span>
                </button>
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  aria-label={readerExpanded ? 'Exit fullscreen' : 'Open fullscreen'}
                  title={readerExpanded ? 'Exit fullscreen' : 'Open fullscreen'}
                  aria-pressed={readerExpanded}
                >
                  {readerExpanded ? <Minimize2 size={17} /> : <Expand size={17} />}
                  <span>{readerExpanded ? 'Exit fullscreen' : 'Fullscreen'}</span>
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
                  <div className={`impact-report-reader__book-wrap${bookPositionClass}`}>
                    <HTMLFlipBook
                      key={`impact-book-${isMobileReader ? 'mobile' : 'desktop'}-${isMobileExpanded ? 'expanded' : 'normal'}`}
                      ref={bookRef}
                      width={isMobileReader ? mobileBookMaxWidth : 447}
                      height={isMobileReader ? mobileBookMaxHeight : 632}
                      size="stretch"
                      minWidth={isMobileReader ? 248 : 300}
                      maxWidth={isMobileReader ? mobileBookMaxWidth : 540}
                      minHeight={isMobileReader ? 351 : 424}
                      maxHeight={isMobileReader ? mobileBookMaxHeight : 764}
                      startPage={Math.max(0, currentPage - 1)}
                      drawShadow
                      flippingTime={860}
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
                      onChangeState={(event) => {
                        const state = event.data
                        const userTurningPage = state === 'user_fold' || state === 'flipping'

                        if (userTurningPage && !paperGestureSoundPlayedRef.current) {
                          playPaperSound()
                          paperGestureSoundPlayedRef.current = true
                        }

                        if (state === 'read') {
                          paperGestureSoundPlayedRef.current = false
                        }

                        setIsFlipping(state === 'flipping')
                      }}
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
