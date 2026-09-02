import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Expand, Minimize2 } from 'lucide-react'

const FLIPBOOK_URL = 'https://online.fliphtml5.com/benua_brutti/Copy-of-Impact-Report-Brutti-2026/'

function backHome() {
  window.location.href = '/'
}

export default function ImpactReportPage() {
  const readerRef = useRef(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await readerRef.current?.requestFullscreen?.()
      } else {
        await document.exitFullscreen?.()
      }
    } catch {
      // The embedded flipbook still works normally when browser fullscreen is unavailable.
    }
  }

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
                Explore the full Brutti Impact Report as an interactive digital book. Flip through our story, growth, people, milestones and the impact behind our work.
              </p>
              <span>40-page digital edition</span>
            </div>
          </div>

          <div className="impact-report-reader" ref={readerRef}>
            <div className="impact-report-reader__toolbar">
              <div>
                <span className="impact-report-reader__dot" />
                <strong>Brutti Impact Report 2026</strong>
              </div>

              <div className="impact-report-reader__actions">
                <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Open fullscreen'}>
                  {isFullscreen ? <Minimize2 size={17} /> : <Expand size={17} />}
                  <span>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</span>
                </button>
                <a href={FLIPBOOK_URL} target="_blank" rel="noreferrer">
                  Open book <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <div className="impact-report-reader__frame-wrap">
              <iframe
                className="impact-report-reader__frame"
                src={FLIPBOOK_URL}
                title="Brutti Impact Report 2026 interactive flipbook"
                allow="fullscreen; clipboard-read; clipboard-write"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>

          <p className="impact-report-reader__hint">
            Drag or tap the page corners to flip pages. On mobile, swipe through the report or use the viewer controls.
          </p>
        </div>
      </section>
    </main>
  )
}
