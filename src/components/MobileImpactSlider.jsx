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
  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook {
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .sedco-native-turn-sheet {
    position: absolute;
    top: 0;
    width: var(--sedco-native-page-w);
    height: var(--sedco-native-page-h);
    z-index: 95;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    pointer-events: none;
    will-change: transform, clip-path, filter;
  }

  .sedco-native-turn-sheet--next {
    left: var(--sedco-native-page-w);
    transform-origin: left center;
    animation: sedco-mobile-turn-next 560ms cubic-bezier(.24,.72,.28,1) both;
  }

  .sedco-native-turn-sheet--prev {
    left: 0;
    transform-origin: right center;
    animation: sedco-mobile-turn-prev 560ms cubic-bezier(.24,.72,.28,1) both;
  }

  .sedco-native-turn-sheet__face {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(0,0,0,.06);
    border-radius: 1px;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
  }

  .sedco-native-turn-sheet__face--front {
    transform: translateZ(.35px);
    box-shadow:
      inset -8px 0 16px rgba(0,0,0,.025),
      0 8px 26px rgba(0,0,0,.18);
  }

  .sedco-native-turn-sheet__face--back {
    transform: rotateY(180deg) translateZ(.35px);
    box-shadow:
      inset 10px 0 20px rgba(0,0,0,.035),
      0 8px 26px rgba(0,0,0,.16);
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
    -webkit-user-drag: none;
    user-select: none;
  }

  .sedco-native-turn-sheet__curl {
    position: absolute;
    z-index: 5;
    top: 0;
    bottom: 0;
    width: 18px;
    opacity: .78;
    pointer-events: none;
    filter: blur(.1px);
  }

  .sedco-native-turn-sheet--next .sedco-native-turn-sheet__curl {
    right: -1px;
    border-radius: 55% 0 0 55%;
    background: linear-gradient(90deg,
      rgba(0,0,0,0),
      rgba(0,0,0,.08) 52%,
      rgba(255,255,255,.72) 78%,
      rgba(0,0,0,.05));
  }

  .sedco-native-turn-sheet--prev .sedco-native-turn-sheet__curl {
    left: -1px;
    border-radius: 0 55% 55% 0;
    background: linear-gradient(90deg,
      rgba(0,0,0,.05),
      rgba(255,255,255,.72) 22%,
      rgba(0,0,0,.08) 48%,
      rgba(0,0,0,0));
  }

  @keyframes sedco-mobile-turn-next {
    0% {
      transform: perspective(1500px) rotateY(0deg) rotateZ(0deg) translateZ(1px);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      filter: drop-shadow(0 7px 11px rgba(0,0,0,.11));
    }
    24% {
      transform: perspective(1500px) rotateY(-34deg) rotateZ(-.35deg) translateZ(5px);
      clip-path: polygon(0 0, 100% 1%, 97% 99%, 0 100%);
      filter: drop-shadow(7px 9px 15px rgba(0,0,0,.18));
    }
    52% {
      transform: perspective(1500px) rotateY(-92deg) rotateZ(-.8deg) translateZ(9px);
      clip-path: polygon(0 0, 97% 5%, 88% 97%, 0 100%);
      filter: drop-shadow(11px 8px 20px rgba(0,0,0,.23));
    }
    76% {
      transform: perspective(1500px) rotateY(-146deg) rotateZ(-.3deg) translateZ(5px);
      clip-path: polygon(0 0, 100% 1%, 97% 99%, 0 100%);
      filter: drop-shadow(6px 7px 14px rgba(0,0,0,.16));
    }
    100% {
      transform: perspective(1500px) rotateY(-180deg) rotateZ(0deg) translateZ(1px);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      filter: drop-shadow(0 3px 7px rgba(0,0,0,.08));
    }
  }

  @keyframes sedco-mobile-turn-prev {
    0% {
      transform: perspective(1500px) rotateY(0deg) rotateZ(0deg) translateZ(1px);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
      filter: drop-shadow(0 7px 11px rgba(0,0,0,.11));
    }
    24% {
      transform: perspective(1500px) rotateY(34deg) rotateZ(.35deg) translateZ(5px);
      clip-path: polygon(3% 1%, 100% 0, 100% 100%, 0 99%);
      filter: drop-shadow(-7px 9px 15px rgba(0,0,0,.18));
    }
    52% {
      transform: perspective(1500px) rotateY(92deg) rotateZ(.8deg) translateZ(9px);
      clip-path: polygon(12% 5%, 100% 0, 100% 100%, 3% 97%);
      filter: drop-shadow(-11px 8px 20px rgba(0,0,0,.23));
    }
    76% {
      transform: perspective(1500px) rotateY(146deg) rotateZ(.3deg) translateZ(5px);
      clip-path: polygon(3% 1%, 100% 0, 100% 100%, 0 99%);
      filter: drop-shadow(-6px 7px 14px rgba(0,0,0,.16));
    }
    100% {
      transform: perspective(1500px) rotateY(180deg) rotateZ(0deg) translateZ(1px);
      clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
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
      </div>
      <div className="sedco-native-turn-sheet__face sedco-native-turn-sheet__face--back">
        <img src={pageImage(sheet.backPage)} alt="" draggable="false" />
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
  const coverFlipRef = useRef(null)
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

  // Keep the approved cover and real two-page book structure, but make each
  // open page large again. The phone camera focuses one page at a time like
  // the supplied SEDCO reference: left page first, then right page, then flip.
  const coverPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const spreadPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const pageWidth = currentPage === 1 ? coverPageWidth : spreadPageWidth
  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])

  // The book itself stays as two clean side-by-side pages. Only the camera
  // pans across the spread, so one page is zoomed/focused at a time.
  const cameraTravel = currentPage === 1 ? 0 : Math.max(0, spreadPageWidth - peekWidth)
  const cameraLeftX = 0
  const cameraRightX = -cameraTravel

  const spreadStartPage = currentPage <= 1
    ? 2
    : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1

  useEffect(() => {
    if (currentPage <= 1) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage])

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
    if (currentPage <= 1) return
    requestAnimationFrame(() => {
      snapCamera(currentPage % 2 === 1 ? 'right' : 'left', false)
    })
  }, [pageWidth])

  const spreadFlip = () => spreadFlipRef.current?.pageFlip?.()
  const coverFlip = () => coverFlipRef.current?.pageFlip?.()

  const beginOpenBookTurn = (direction) => {
    if (isTurning) return

    const isNext = direction === 'next'
    const destinationStart = isNext ? spreadStartPage + 2 : spreadStartPage - 2
    const targetLeftPage = destinationStart

    const sheet = isNext
      ? {
          direction: 'next',
          frontPage: Math.min(totalPages, spreadStartPage + 1),
          backPage: Math.min(totalPages, spreadStartPage + 2),
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
      requestAnimationFrame(() => snapCamera('left', false))
      onPageChange?.(targetLeftPage)
      setTurnSheet(null)
      setIsTurning(false)
      soundPlayedRef.current = false
      turnTimerRef.current = null
    }, 560)
  }

  const moveToNextStep = () => {
    if (isTurning) return

    if (currentPage === 1) {
      coverFlip()?.flipNext('top')
      return
    }

    // First swipe: stay on the same physical spread and move the camera from
    // the left page to the right page. No sheet turns yet.
    if (cameraSide === 'left' && spreadStartPage + 1 <= totalPages) {
      snapCamera('right', true)
      onPageChange?.(Math.min(totalPages, spreadStartPage + 1))
      return
    }

    // Second swipe: after the right page has been read, turn that sheet to the
    // next physical spread, then focus the new left page.
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
      <div
        className="sedco-native-viewer is-cover"
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

          <HTMLFlipBook
            ref={coverFlipRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            startPage={0}
            drawShadow
            flippingTime={500}
            usePortrait
            startZIndex={40}
            autoSize={false}
            maxShadowOpacity={0.46}
            showCover
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={6}
            showPageCorners
            disableFlipByClick
            className="sedco-native-flipbook"
            onFlip={(event) => {
              if (Number(event.data) >= 1) onPageChange?.(2)
            }}
            onChangeState={(event) => {
              const state = event.data
              const turning = state === 'user_fold' || state === 'flipping'
              setIsTurning(turning)

              if (turning && !soundPlayedRef.current) {
                onPageTurn?.()
                soundPlayedRef.current = true
              }

              if (state === 'read') {
                setIsTurning(false)
                soundPlayedRef.current = false
              }
            }}
          >
            <SedcoPage page={1} totalPages={totalPages} />
            <SedcoPage page={2} totalPages={totalPages} />
          </HTMLFlipBook>
        </div>
      </div>
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
              key={`spread-${spreadStartPage}-${pageWidth}`}
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
              flippingTime={540}
              usePortrait={false}
              startZIndex={40}
              autoSize={false}
              maxShadowOpacity={0.46}
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
