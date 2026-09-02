import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
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
  const audioContextRef = useRef(null)
  const lastPaperSoundAt = useRef(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close?.()
      }
    }
  }, [])

  const playPaperSound = () => {
    if (!soundEnabled) return

    const timestamp = performance.now()
    if (timestamp - lastPaperSoundAt.current < 260) return
    lastPaperSoundAt.current = timestamp

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    let context = audioContextRef.current
    if (!context || context.state === 'closed') {
      context = new AudioContextClass()
      audioContextRef.current = context
    }

    const noiseBurst = ({ start, duration, gainValue, highpass, lowpass, attack = 0.018 }) => {
      const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
      const buffer = context.createBuffer(1, frameCount, context.sampleRate)
      const data = buffer.getChannelData(0)

      let previous = 0
      for (let index = 0; index < frameCount; index += 1) {
        const progress = index / frameCount
        const white = Math.random() * 2 - 1
        previous = previous * 0.35 + white * 0.65
        const texture = 0.78 + Math.sin(progress * Math.PI * 14) * 0.08 + Math.sin(progress * Math.PI * 5) * 0.06
        data[index] = previous * texture
      }

      const source = context.createBufferSource()
      const hp = context.createBiquadFilter()
      const lp = context.createBiquadFilter()
      const gain = context.createGain()

      source.buffer = buffer
      hp.type = 'highpass'
      hp.frequency.value = highpass
      lp.type = 'lowpass'
      lp.frequency.value = lowpass

      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(gainValue, start + attack)
      gain.gain.exponentialRampToValueAtTime(Math.max(0.00012, gainValue * 0.45), start + duration * 0.68)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

      source.connect(hp)
      hp.connect(lp)
      lp.connect(gain)
      gain.connect(context.destination)
      source.start(start)
      source.stop(start + duration + 0.025)
    }

    const play = () => {
      const start = context.currentTime + 0.006

      // Soft pickup of the paper.
      noiseBurst({ start, duration: 0.075, gainValue: 0.052, highpass: 1150, lowpass: 7600, attack: 0.008 })

      // Continuous page-rustle while the sheet bends.
      noiseBurst({ start: start + 0.025, duration: 0.43, gainValue: 0.038, highpass: 620, lowpass: 6900, attack: 0.05 })

      // Crisp paper landing near the end of the turn, matching the reference feel.
      noiseBurst({ start: start + 0.315, duration: 0.105, gainValue: 0.12, highpass: 1050, lowpass: 6200, attack: 0.009 })
      noiseBurst({ start: start + 0.34, duration: 0.07, gainValue: 0.052, highpass: 1900, lowpass: 8200, attack: 0.006 })
    }

    if (context.state === 'suspended') {
      context.resume().then(play).catch(() => {})
    } else {
      play()
    }
  }

  useEffect(() => {
    const onKeyDown = (event) => {
      const pageFlip = bookRef.current?.pageFlip?.()
      if (!pageFlip || isFlipping) return

      if (event.key === 'ArrowRight') pageFlip.flipNext('top')
      if (event.key === 'ArrowLeft') pageFlip.flipPrev('top')
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
    if (currentPage <= 1 || currentPage >= TOTAL_PAGES) return `${currentPage}/${TOTAL_PAGES}`

    const left = currentPage % 2 === 0 ? currentPage : currentPage - 1
    const right = Math.min(TOTAL_PAGES, left + 1)
    return `${left}–${right}/${TOTAL_PAGES}`
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
            <div className="impact-report-reader__stage">
              <button
                className="impact-report-reader__edge impact-report-reader__edge--left"
                onClick={previousPage}
                disabled={currentPage <= 1 || isFlipping}
                aria-label="Previous page"
              >
                <ChevronLeft size={35} strokeWidth={1.75} />
              </button>

              <div className={`impact-report-reader__viewport${zoom > 1 ? ' is-zoomed' : ''}`}>
                <div className="impact-report-reader__zoom" style={{ '--impact-zoom': zoom }}>
                  <div className="impact-report-reader__book-wrap">
                    <HTMLFlipBook
                      ref={bookRef}
                      width={447}
                      height={632}
                      size="stretch"
                      minWidth={260}
                      maxWidth={445}
                      minHeight={368}
                      maxHeight={630}
                      startPage={0}
                      drawShadow
                      flippingTime={680}
                      usePortrait
                      startZIndex={10}
                      autoSize
                      maxShadowOpacity={0.3}
                      showCover
                      mobileScrollSupport
                      clickEventForward={false}
                      useMouseEvents
                      swipeDistance={24}
                      showPageCorners
                      disableFlipByClick={false}
                      className="impact-html-flipbook"
                      onFlip={(event) => setCurrentPage(event.data + 1)}
                      onChangeState={(event) => {
                        const flipping = event.data === 'flipping'
                        if (flipping) playPaperSound()
                        setIsFlipping(flipping)
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
                <ChevronRight size={35} strokeWidth={1.75} />
              </button>

              <div className="impact-report-reader__dock" aria-label="Impact report controls">
                <strong className="impact-report-reader__page-count">{pageLabel}</strong>
                <span className="impact-report-reader__dock-divider" />

                <button
                  onClick={() => setZoom((value) => Math.max(0.9, Number((value - 0.1).toFixed(2))))}
                  disabled={zoom <= 0.9}
                  aria-label="Zoom out"
                  title="Zoom out"
                >
                  <ZoomOut size={16} />
                </button>

                <span className="impact-report-reader__zoom-value">{Math.round(zoom * 100)}%</span>

                <button
                  onClick={() => setZoom((value) => Math.min(1.4, Number((value + 0.1).toFixed(2))))}
                  disabled={zoom >= 1.4}
                  aria-label="Zoom in"
                  title="Zoom in"
                >
                  <ZoomIn size={16} />
                </button>

                {zoom !== 1 && (
                  <button onClick={() => setZoom(1)} aria-label="Reset zoom" title="Reset zoom">
                    <RotateCcw size={15} />
                  </button>
                )}

                <span className="impact-report-reader__dock-divider" />

                <button
                  onClick={() => setSoundEnabled((enabled) => !enabled)}
                  aria-label={soundEnabled ? 'Mute page sound' : 'Enable page sound'}
                  title={soundEnabled ? 'Page sound on' : 'Page sound off'}
                  aria-pressed={soundEnabled}
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'} title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                  {isFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
                </button>
              </div>
            </div>
          </div>

          <input
            className="impact-report-reader__scrubber"
            aria-label="Jump to page"
            type="range"
            min="1"
            max={TOTAL_PAGES}
            value={currentPage}
            onChange={(event) => jumpToPage(event.target.value)}
          />

          <p className="impact-report-reader__hint">
            Drag a page corner to turn it like a real book, tap the page edge, or use the keyboard arrows. On mobile, swipe left or right.
          </p>
        </div>
      </section>
    </main>
  )
}
