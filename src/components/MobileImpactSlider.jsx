import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-sedco-native.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const MOBILE_TURN_SHEET_CSS = `
@media (max-width: 700px) {
  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook.sedco-native-spread-flipbook {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .sedco-native-turn-sheet {
    position: absolute;
    top: 0;
    width: var(--sedco-native-page-w);
    height: var(--sedco-native-page-h);
    z-index: 95;
    pointer-events: none;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    will-change: transform, filter;
  }

  .sedco-native-turn-sheet--next {
    left: var(--sedco-native-page-w);
    transform-origin: left center;
    animation: sedco-mobile-turn-next-visible 860ms cubic-bezier(.20,.72,.18,1) both;
  }

  .sedco-native-turn-sheet--prev {
    left: 0;
    transform-origin: right center;
    animation: sedco-mobile-turn-prev-visible 860ms cubic-bezier(.20,.72,.18,1) both;
  }

  .sedco-native-turn-sheet__face {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(0,0,0,.055);
    border-radius: 1px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }

  .sedco-native-turn-sheet__face--front {
    transform: translateZ(.7px);
    box-shadow:
      inset -10px 0 18px rgba(0,0,0,.025),
      0 8px 24px rgba(0,0,0,.18);
  }

  .sedco-native-turn-sheet__face--back {
    transform: rotateY(180deg) translateZ(.7px);
    box-shadow:
      inset 12px 0 22px rgba(0,0,0,.04),
      0 8px 24px rgba(0,0,0,.16);
  }

  .sedco-native-turn-sheet__face img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: contain;
    object-position: center;
    background: #fff;
    opacity: 1;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  .sedco-native-turn-sheet__shade,
  .sedco-native-turn-sheet__curl {
    position: absolute;
    top: 0;
    bottom: 0;
    pointer-events: none;
  }

  .sedco-native-turn-sheet__shade {
    z-index: 4;
    inset: 0;
    opacity: .36;
    background: linear-gradient(90deg,
      rgba(0,0,0,.02),
      transparent 18%,
      transparent 74%,
      rgba(0,0,0,.10));
  }

  .sedco-native-turn-sheet__curl {
    z-index: 6;
    width: 20px;
    opacity: .82;
  }

  .sedco-native-turn-sheet--next .sedco-native-turn-sheet__curl {
    right: -1px;
    background: linear-gradient(90deg,
      rgba(0,0,0,0),
      rgba(0,0,0,.09) 48%,
      rgba(255,255,255,.82) 75%,
      rgba(0,0,0,.055));
  }

  .sedco-native-turn-sheet--prev .sedco-native-turn-sheet__curl {
    left: -1px;
    background: linear-gradient(90deg,
      rgba(0,0,0,.055),
      rgba(255,255,255,.82) 25%,
      rgba(0,0,0,.09) 52%,
      rgba(0,0,0,0));
  }

  @keyframes sedco-mobile-turn-next-visible {
    0% {
      transform: perspective(1900px) rotateY(0deg) rotateZ(0deg) translateZ(1px);
      filter: drop-shadow(0 5px 8px rgba(0,0,0,.10));
    }
    10% {
      transform: perspective(1900px) rotateY(-5deg) rotateZ(-.03deg) translateZ(2px);
      filter: drop-shadow(2px 6px 9px rgba(0,0,0,.11));
    }
    22% {
      transform: perspective(1900px) rotateY(-18deg) rotateZ(-.10deg) translateZ(3px);
      filter: drop-shadow(4px 7px 11px rgba(0,0,0,.13));
    }
    36% {
      transform: perspective(1900px) rotateY(-44deg) rotateZ(-.22deg) translateZ(5px);
      filter: drop-shadow(7px 8px 14px rgba(0,0,0,.16));
    }
    50% {
      transform: perspective(1900px) rotateY(-86deg) rotateZ(-.32deg) translateZ(8px);
      filter: drop-shadow(11px 8px 18px rgba(0,0,0,.21));
    }
    64% {
      transform: perspective(1900px) rotateY(-124deg) rotateZ(-.24deg) translateZ(6px);
      filter: drop-shadow(8px 8px 15px rgba(0,0,0,.18));
    }
    78% {
      transform: perspective(1900px) rotateY(-153deg) rotateZ(-.12deg) translateZ(4px);
      filter: drop-shadow(5px 7px 12px rgba(0,0,0,.14));
    }
    90% {
      transform: perspective(1900px) rotateY(-174deg) rotateZ(-.03deg) translateZ(2px);
      filter: drop-shadow(2px 5px 9px rgba(0,0,0,.10));
    }
    100% {
      transform: perspective(1900px) rotateY(-180deg) rotateZ(0deg) translateZ(1px);
      filter: drop-shadow(0 3px 6px rgba(0,0,0,.07));
    }
  }

  @keyframes sedco-mobile-turn-prev-visible {
    0% {
      transform: perspective(1900px) rotateY(0deg) rotateZ(0deg) translateZ(1px);
      filter: drop-shadow(0 5px 8px rgba(0,0,0,.10));
    }
    10% {
      transform: perspective(1900px) rotateY(5deg) rotateZ(.03deg) translateZ(2px);
      filter: drop-shadow(-2px 6px 9px rgba(0,0,0,.11));
    }
    22% {
      transform: perspective(1900px) rotateY(18deg) rotateZ(.10deg) translateZ(3px);
      filter: drop-shadow(-4px 7px 11px rgba(0,0,0,.13));
    }
    36% {
      transform: perspective(1900px) rotateY(44deg) rotateZ(.22deg) translateZ(5px);
      filter: drop-shadow(-7px 8px 14px rgba(0,0,0,.16));
    }
    50% {
      transform: perspective(1900px) rotateY(86deg) rotateZ(.32deg) translateZ(8px);
      filter: drop-shadow(-11px 8px 18px rgba(0,0,0,.21));
    }
    64% {
      transform: perspective(1900px) rotateY(124deg) rotateZ(.24deg) translateZ(6px);
      filter: drop-shadow(-8px 8px 15px rgba(0,0,0,.18));
    }
    78% {
      transform: perspective(1900px) rotateY(153deg) rotateZ(.12deg) translateZ(4px);
      filter: drop-shadow(-5px 7px 12px rgba(0,0,0,.14));
    }
    90% {
      transform: perspective(1900px) rotateY(174deg) rotateZ(.03deg) translateZ(2px);
      filter: drop-shadow(-2px 5px 9px rgba(0,0,0,.10));
    }
    100% {
      transform: perspective(1900px) rotateY(180deg) rotateZ(0deg) translateZ(1px);
      filter: drop-shadow(0 3px 6px rgba(0,0,0,.07));
    }
  }
}
`

const MOBILE_COVER_FLIP_CSS = `
@media (max-width: 700px) {
  .sedco-native-cover-stage {
    position: absolute;
    inset: 0;
    z-index: 8;
    width: var(--sedco-native-page-w);
    height: var(--sedco-native-page-h);
    perspective: 1900px;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    pointer-events: none;
  }

  .sedco-native-cover-under {
    position: absolute;
    inset: 0;
    z-index: 1;
    overflow: hidden;
    background: #fff;
    border-radius: 1px;
    box-shadow: inset 7px 0 13px rgba(0,0,0,.035);
  }

  .sedco-native-cover-under img,
  .sedco-native-cover-sheet__face img {
    display: block;
    width: 100%;
    height: 100%;
    max-width: none;
    object-fit: contain;
    object-position: center;
    background: #fff;
    opacity: 1;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
  }

  .sedco-native-cover-sheet {
    position: absolute;
    inset: 0;
    z-index: 5;
    transform-origin: left center;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    will-change: transform, filter;
  }

  .sedco-native-cover-sheet.is-opening {
    animation: sedco-mobile-cover-open 860ms cubic-bezier(.22,.82,.24,1) both;
  }

  .sedco-native-cover-sheet__face {
    position: absolute;
    inset: 0;
    overflow: hidden;
    border-radius: 1px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }

  .sedco-native-cover-sheet__face--front {
    z-index: 2;
    background: #fff;
    transform: translateZ(.8px);
    box-shadow: 0 8px 22px rgba(0,0,0,.18);
  }

  .sedco-native-cover-sheet__face--back {
    z-index: 1;
    background: #f8f7f3;
    transform: rotateY(180deg) translateZ(.8px);
    box-shadow:
      inset 15px 0 24px rgba(0,0,0,.065),
      inset -2px 0 4px rgba(0,0,0,.025);
  }

  .sedco-native-cover-sheet__face--back::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg,
      rgba(0,0,0,.055),
      rgba(0,0,0,.012) 16%,
      transparent 42%,
      rgba(255,255,255,.18));
  }

  @keyframes sedco-mobile-cover-open {
    0% {
      transform: rotateY(0deg) translateZ(1px);
      filter: drop-shadow(0 7px 10px rgba(0,0,0,.12));
    }
    16% {
      transform: rotateY(-12deg) translateZ(2px);
      filter: drop-shadow(3px 8px 12px rgba(0,0,0,.14));
    }
    34% {
      transform: rotateY(-38deg) translateZ(4px);
      filter: drop-shadow(7px 9px 15px rgba(0,0,0,.17));
    }
    52% {
      transform: rotateY(-88deg) translateZ(7px);
      filter: drop-shadow(11px 8px 19px rgba(0,0,0,.21));
    }
    70% {
      transform: rotateY(-133deg) translateZ(5px);
      filter: drop-shadow(8px 8px 16px rgba(0,0,0,.17));
    }
    86% {
      transform: rotateY(-166deg) translateZ(2px);
      filter: drop-shadow(3px 6px 11px rgba(0,0,0,.12));
    }
    100% {
      transform: rotateY(-180deg) translateZ(1px);
      filter: drop-shadow(0 3px 7px rgba(0,0,0,.08));
    }
  }
}
`

const SedcoPage = forwardRef(function SedcoPage({ page, totalPages, forceSoft = false }, ref) {
  const isCover = !forceSoft && (page === 1 || page === totalPages)

  return (
    <div
      ref={ref}
      className={`sedco-native-page${isCover ? ' sedco-native-page--cover' : ''}`}
      data-density={isCover ? 'hard' : 'soft'}
    >
      <img
        src={pageImage(page)}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading={page <= 5 ? 'eager' : 'lazy'}
        fetchPriority={page <= 2 ? 'high' : 'auto'}
      />
    </div>
  )
})

function StaticSpread({ leftPage, rightPage, totalPages }) {
  return (
    <div className="sedco-native-static-spread" aria-hidden="true">
      <div className="sedco-native-static-page sedco-native-static-page--left">
        <img src={pageImage(leftPage)} alt="" draggable="false" />
      </div>
      <div className="sedco-native-static-page sedco-native-static-page--right">
        {rightPage <= totalPages && (
          <img src={pageImage(rightPage)} alt="" draggable="false" />
        )}
      </div>
    </div>
  )
}

function TurningSheet({ sheet }) {
  if (!sheet) return null

  return (
    <div className={`sedco-native-turn-sheet sedco-native-turn-sheet--${sheet.direction}`} aria-hidden="true">
      <div className="sedco-native-turn-sheet__face sedco-native-turn-sheet__face--front">
        <img src={pageImage(sheet.frontPage)} alt="" draggable="false" />
        <span className="sedco-native-turn-sheet__shade" />
      </div>
      <div className="sedco-native-turn-sheet__face sedco-native-turn-sheet__face--back">
        <img src={pageImage(sheet.backPage)} alt="" draggable="false" />
        <span className="sedco-native-turn-sheet__shade" />
      </div>
      <span className="sedco-native-turn-sheet__curl" />
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const spreadFlipRef = useRef(null)
  const cameraRef = useRef(null)
  const gestureRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const turnTimerRef = useRef(null)
  const [isTurning, setIsTurning] = useState(false)
  const [turnSheet, setTurnSheet] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [cameraSide, setCameraSide] = useState(() => (
    currentPage > 1 && currentPage % 2 === 1 ? 'right' : 'left'
  ))

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', sync, { passive: true })
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => () => {
    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current)
  }, [])

  const coverPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const spreadPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const pageWidth = currentPage === 1 ? coverPageWidth : spreadPageWidth
  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])

  const cameraTravel = currentPage === 1 ? 0 : Math.max(0, spreadPageWidth - peekWidth)
  const cameraLeftX = 0
  const cameraRightX = -cameraTravel

  const spreadStartPage = currentPage <= 1
    ? 2
    : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1

  useEffect(() => {
    if (currentPage <= 1 || turnSheet) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage, turnSheet])

  const setCameraTransform = (x, animate = true) => {
    if (!cameraRef.current) return
    cameraRef.current.style.transition = animate
      ? 'transform 420ms cubic-bezier(.22,.82,.24,1)'
      : 'none'
    cameraRef.current.style.transform = `translate3d(${x}px,0,0)`
  }

  const snapCamera = (side, animate = true) => {
    const x = side === 'right' ? cameraRightX : cameraLeftX
    setCameraSide(side)
    setCameraTransform(x, animate)
  }

  useEffect(() => {
    if (currentPage <= 1 || turnSheet) return
    requestAnimationFrame(() => {
      snapCamera(currentPage % 2 === 1 ? 'right' : 'left', false)
    })
  }, [pageWidth])

  const spreadFlip = () => spreadFlipRef.current?.pageFlip?.()

  const beginCoverTurn = () => {
    if (isTurning || currentPage !== 1) return

    setIsTurning(true)

    if (!soundPlayedRef.current) {
      onPageTurn?.()
      soundPlayedRef.current = true
    }

    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current)
    turnTimerRef.current = window.setTimeout(() => {
      setIsTurning(false)
      soundPlayedRef.current = false
      turnTimerRef.current = null
      onPageChange?.(2)
    }, 860)
  }

  const beginOpenBookTurn = (direction) => {
    if (isTurning) return

    const isNext = direction === 'next'
    const destinationStart = isNext ? spreadStartPage + 2 : spreadStartPage - 2
    const sheet = isNext
      ? {
          direction: 'next',
          frontPage: Math.min(totalPages, spreadStartPage + 1),
          backPage: Math.min(totalPages, destinationStart),
          destinationStart,
        }
      : {
          direction: 'prev',
          frontPage: spreadStartPage,
          backPage: Math.max(1, spreadStartPage - 1),
          destinationStart,
        }

    setTurnSheet(sheet)
    setIsTurning(true)

    if (!soundPlayedRef.current) {
      onPageTurn?.()
      soundPlayedRef.current = true
    }

    if (isNext) spreadFlip()?.flipNext('top')
    else spreadFlip()?.flipPrev('top')

    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current)
    turnTimerRef.current = window.setTimeout(() => {
      spreadFlip()?.turnToPage(Math.max(0, destinationStart - 2))
      requestAnimationFrame(() => snapCamera('left', false))
      onPageChange?.(destinationStart)
      setTurnSheet(null)
      setIsTurning(false)
      soundPlayedRef.current = false
      turnTimerRef.current = null
    }, 860)
  }

  const moveToNextStep = () => {
    if (isTurning) return

    if (currentPage === 1) {
      beginCoverTurn()
      return
    }

    if (cameraSide === 'left' && spreadStartPage + 1 <= totalPages) {
      snapCamera('right', true)
      onPageChange?.(Math.min(totalPages, spreadStartPage + 1))
      return
    }

    if (cameraSide === 'right' && spreadStartPage + 2 <= totalPages) {
      beginOpenBookTurn('next')
    }
  }

  const moveToPreviousStep = () => {
    if (isTurning || currentPage <= 1) return

    if (cameraSide === 'right') {
      snapCamera('left', true)
      onPageChange?.(spreadStartPage)
      return
    }

    if (spreadStartPage <= 2) {
      onPageChange?.(1)
      return
    }

    beginOpenBookTurn('prev')
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (target === 1) {
        onPageChange?.(1)
        return
      }

      const spread = target % 2 === 0 ? target : target - 1
      spreadFlip()?.turnToPage(Math.max(0, spread - 2))
      requestAnimationFrame(() => {
        snapCamera(target % 2 === 1 ? 'right' : 'left', false)
      })
    },
    next() {
      moveToNextStep()
    },
    previous() {
      moveToPreviousStep()
    },
  }))

  const handlePointerDown = (event) => {
    if (isTurning) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      locked: null,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || isTurning) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY

    if (gesture.locked === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.05 ? 'horizontal' : 'vertical'
    }

    if (gesture.locked !== 'horizontal') return

    if (currentPage > 1 && cameraSide === 'left' && dx < 0) {
      setCameraTransform(clamp(cameraLeftX + dx, cameraRightX, cameraLeftX), false)
      return
    }

    if (currentPage > 1 && cameraSide === 'right' && dx > 0) {
      setCameraTransform(clamp(cameraRightX + dx, cameraRightX, cameraLeftX), false)
    }
  }

  const handlePointerEnd = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal') return

    const dx = event.clientX - gesture.startX
    const threshold = Math.max(34, spreadPageWidth * 0.14)

    if (dx <= -threshold) {
      moveToNextStep()
      return
    }

    if (dx >= threshold) {
      moveToPreviousStep()
      return
    }

    if (currentPage > 1) snapCamera(cameraSide, true)
  }

  if (currentPage === 1) {
    return (
      <>
        <style>{MOBILE_COVER_FLIP_CSS}</style>
        <div
          className={`sedco-native-viewer is-cover${isTurning ? ' is-turning' : ''}`}
          style={{
            '--sedco-native-page-w': `${pageWidth}px`,
            '--sedco-native-page-h': `${pageHeight}px`,
            '--sedco-native-peek-w': `${peekWidth}px`,
          }}
          aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
        >
          <div className="sedco-native-holder sedco-native-holder--cover">
            <div className="sedco-native-book-bed" aria-hidden="true" />
            <div className="sedco-native-paper-edge sedco-native-paper-edge--1" aria-hidden="true" />
            <div className="sedco-native-paper-edge sedco-native-paper-edge--2" aria-hidden="true" />

            <div className="sedco-native-cover-stage" aria-hidden="true">
              <div className="sedco-native-cover-under">
                <img src={pageImage(2)} alt="" draggable="false" />
              </div>

              <div className={`sedco-native-cover-sheet${isTurning ? ' is-opening' : ''}`}>
                <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--front">
                  <img src={pageImage(1)} alt="" draggable="false" />
                </div>
                <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--back" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const visibleSpreadStart = turnSheet?.destinationStart ?? spreadStartPage

  return (
    <>
      <style>{MOBILE_TURN_SHEET_CSS}</style>
      <div
        className={`sedco-native-viewer is-open-book is-camera-${cameraSide}${isTurning ? ' is-turning' : ''}`}
        style={{
          '--sedco-native-page-w': `${pageWidth}px`,
          '--sedco-native-page-h': `${pageHeight}px`,
          '--sedco-native-peek-w': `${peekWidth}px`,
          '--sedco-native-camera-travel': `${cameraTravel}px`,
        }}
        aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="sedco-native-camera-window">
          <div ref={cameraRef} className="sedco-native-camera-track">
            <div className="sedco-native-spread-bed" aria-hidden="true" />

            <StaticSpread
              leftPage={visibleSpreadStart}
              rightPage={visibleSpreadStart + 1}
              totalPages={totalPages}
            />

            <TurningSheet sheet={turnSheet} />

            <HTMLFlipBook
              key={`spread-${pageWidth}`}
              ref={spreadFlipRef}
              width={pageWidth}
              height={pageHeight}
              size="fixed"
              minWidth={pageWidth}
              maxWidth={pageWidth}
              minHeight={pageHeight}
              maxHeight={pageHeight}
              startPage={Math.max(0, spreadStartPage - 2)}
              drawShadow
              flippingTime={860}
              usePortrait={false}
              startZIndex={40}
              autoSize={false}
              maxShadowOpacity={0.34}
              showCover={false}
              mobileScrollSupport={false}
              clickEventForward={false}
              useMouseEvents={false}
              swipeDistance={999}
              showPageCorners
              disableFlipByClick
              className="sedco-native-flipbook sedco-native-spread-flipbook"
            >
              {Array.from({ length: totalPages - 1 }, (_, index) => (
                <SedcoPage
                  page={index + 2}
                  totalPages={totalPages}
                  forceSoft
                  key={index + 2}
                />
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </>
  )
})

export default MobileImpactSlider
