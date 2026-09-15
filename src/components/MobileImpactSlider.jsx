import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-sedco-native.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const CAMERA_FULL_MS = 420
const PAGE_FLIP_MS = 860
const COVER_FULL_MS = 780

const MOBILE_COVER_CSS = `
@media (max-width: 700px) {
  .sedco-native-cover-stage,
  .sedco-native-cover-closing-stage {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 96;
    width: var(--sedco-native-page-w);
    height: var(--sedco-native-page-h);
    perspective: 1900px;
    transform-style: preserve-3d;
    -webkit-transform-style: preserve-3d;
    pointer-events: none;
  }

  .sedco-native-cover-stage {
    inset: 0;
    z-index: 8;
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
    box-shadow: inset 15px 0 24px rgba(0,0,0,.065), inset -2px 0 4px rgba(0,0,0,.025);
  }
}
`

const MOBILE_LAPTOP_FLIP_CSS = `
@media (max-width: 700px) {
  /* Keep the approved mobile camera/layout. Only the page-turn layer uses the
     same react-pageflip motion as the laptop reader. */
  .sedco-native-viewer.is-open-book .sedco-native-spread-flipbook {
    pointer-events: none !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook {
    opacity: 1 !important;
    visibility: visible !important;
    z-index: 95 !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-static-spread {
    opacity: 1 !important;
    z-index: 5 !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook .stf__parent,
  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook .stf__wrapper {
    overflow: visible !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook .stf__block {
    background: transparent !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook,
  .sedco-native-viewer.is-open-book.is-turning .sedco-native-spread-flipbook * {
    animation: none !important;
  }

  .sedco-native-viewer.is-open-book.is-turning .sedco-native-page {
    border-radius: 0 !important;
  }
}
`

const SedcoPage = forwardRef(function SedcoPage({ page, totalPages }, ref) {
  const isCover = page === 1 || page === totalPages
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
        loading={page <= 6 ? 'eager' : 'lazy'}
        fetchPriority={page <= 3 ? 'high' : 'auto'}
      />
    </div>
  )
})

function StaticSpread({ leftPage, rightPage, totalPages }) {
  return (
    <div className="sedco-native-static-spread" aria-hidden="true">
      <div className="sedco-native-static-page sedco-native-static-page--left">
        {leftPage >= 1 && leftPage <= totalPages && <img src={pageImage(leftPage)} alt="" draggable="false" />}
      </div>
      <div className="sedco-native-static-page sedco-native-static-page--right">
        {rightPage >= 1 && rightPage <= totalPages && <img src={pageImage(rightPage)} alt="" draggable="false" />}
      </div>
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({ totalPages, currentPage, onPageChange, onPageTurn }, ref) {
  const spreadFlipRef = useRef(null)
  const coverSheetRef = useRef(null)
  const closingCoverSheetRef = useRef(null)
  const gestureRef = useRef(null)
  const nativeTurnRef = useRef(null)
  const nativeFlipStartedRef = useRef(false)
  const nativeFallbackTimerRef = useRef(null)
  const cameraTimerRef = useRef(null)

  const [isTurning, setIsTurning] = useState(false)
  const [coverClosing, setCoverClosing] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 390 : window.innerWidth))
  const [cameraSide, setCameraSide] = useState(() => (currentPage > 1 && currentPage % 2 === 1 ? 'right' : 'left'))
  const [cameraAnimating, setCameraAnimating] = useState(false)

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', sync, { passive: true })
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => () => {
    if (nativeFallbackTimerRef.current) window.clearTimeout(nativeFallbackTimerRef.current)
    if (cameraTimerRef.current) window.clearTimeout(cameraTimerRef.current)
  }, [])

  const pageWidth = useMemo(() => Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80))), [viewportWidth])
  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])
  const cameraTravel = currentPage === 1 ? 0 : Math.max(0, pageWidth - peekWidth)
  const spreadStartPage = currentPage <= 1 ? 2 : currentPage % 2 === 0 ? currentPage : currentPage - 1
  const cameraX = cameraSide === 'right' ? -cameraTravel : 0

  useEffect(() => {
    if (isTurning || coverClosing || cameraAnimating || currentPage <= 1) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage, isTurning, coverClosing, cameraAnimating])

  useEffect(() => {
    const warm = (page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    }
    ;[
      spreadStartPage - 2,
      spreadStartPage - 1,
      spreadStartPage,
      spreadStartPage + 1,
      spreadStartPage + 2,
      spreadStartPage + 3,
    ].forEach(warm)
  }, [spreadStartPage, totalPages])

  const playTurnSound = () => onPageTurn?.()

  const clearNativeFallback = () => {
    if (!nativeFallbackTimerRef.current) return
    window.clearTimeout(nativeFallbackTimerRef.current)
    nativeFallbackTimerRef.current = null
  }

  const finishNativeTurn = () => {
    const turn = nativeTurnRef.current
    if (!turn) return

    clearNativeFallback()
    nativeTurnRef.current = null
    nativeFlipStartedRef.current = false

    if (turn.direction === 'next') {
      setCameraSide('left')
      onPageChange?.(turn.destinationStart)
    } else {
      setCameraSide('right')
      onPageChange?.(Math.min(totalPages, turn.destinationStart + 1))
    }

    setIsTurning(false)
  }

  const beginNativeTurn = (direction) => {
    if (isTurning || coverClosing) return

    const isNext = direction === 'next'
    const destinationStart = isNext ? spreadStartPage + 2 : spreadStartPage - 2
    if (destinationStart < 2 || destinationStart > totalPages) return

    const pageFlip = spreadFlipRef.current?.pageFlip?.()
    if (!pageFlip) return

    nativeTurnRef.current = { direction, destinationStart }
    nativeFlipStartedRef.current = false
    setIsTurning(true)
    playTurnSound()

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const flip = spreadFlipRef.current?.pageFlip?.()
        if (!flip || !nativeTurnRef.current) return

        nativeFlipStartedRef.current = true
        if (direction === 'next') flip.flipNext('top')
        else flip.flipPrev('top')

        clearNativeFallback()
        nativeFallbackTimerRef.current = window.setTimeout(finishNativeTurn, PAGE_FLIP_MS + 180)
      })
    })
  }

  const panCamera = (side, updatePage = true) => {
    if (isTurning || coverClosing || cameraAnimating) return
    if (cameraTimerRef.current) window.clearTimeout(cameraTimerRef.current)

    setCameraAnimating(true)
    setCameraSide(side)
    cameraTimerRef.current = window.setTimeout(() => {
      setCameraAnimating(false)
      cameraTimerRef.current = null
      if (updatePage) {
        onPageChange?.(side === 'right' ? Math.min(totalPages, spreadStartPage + 1) : spreadStartPage)
      }
    }, CAMERA_FULL_MS + 12)
  }

  const animateCover = (direction) => {
    const sheet = direction === 'open' ? coverSheetRef.current : closingCoverSheetRef.current
    if (!sheet) return Promise.resolve()

    const keyframes = direction === 'open'
      ? [
          { transform: 'perspective(1900px) rotateY(0deg) translateZ(1px)', filter: 'drop-shadow(0 7px 10px rgba(0,0,0,.12))' },
          { transform: 'perspective(1900px) rotateY(-90deg) translateZ(7px)', filter: 'drop-shadow(11px 8px 19px rgba(0,0,0,.21))', offset: 0.5 },
          { transform: 'perspective(1900px) rotateY(-180deg) translateZ(1px)', filter: 'drop-shadow(0 3px 7px rgba(0,0,0,.08))' },
        ]
      : [
          { transform: 'perspective(1900px) rotateY(-180deg) translateZ(1px)', filter: 'drop-shadow(0 3px 7px rgba(0,0,0,.08))' },
          { transform: 'perspective(1900px) rotateY(-90deg) translateZ(7px)', filter: 'drop-shadow(-11px 8px 19px rgba(0,0,0,.21))', offset: 0.5 },
          { transform: 'perspective(1900px) rotateY(0deg) translateZ(1px)', filter: 'drop-shadow(0 7px 10px rgba(0,0,0,.12))' },
        ]

    const animation = sheet.animate(keyframes, {
      duration: COVER_FULL_MS,
      easing: 'cubic-bezier(.22,.75,.24,1)',
      fill: 'forwards',
    })

    return animation.finished.catch(() => {})
  }

  const openCover = async () => {
    if (isTurning || currentPage !== 1) return
    setIsTurning(true)
    playTurnSound()
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await animateCover('open')
    setIsTurning(false)
    setCameraSide('left')
    onPageChange?.(2)
  }

  const closeCover = async () => {
    if (isTurning || coverClosing || currentPage <= 1 || spreadStartPage > 2 || cameraSide !== 'left') return
    setCoverClosing(true)
    setIsTurning(true)
    playTurnSound()
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    await animateCover('close')
    setCoverClosing(false)
    setIsTurning(false)
    onPageChange?.(1)
  }

  const moveToNextStep = () => {
    if (isTurning || coverClosing || cameraAnimating) return
    if (currentPage === 1) {
      openCover()
      return
    }
    if (cameraSide === 'left' && spreadStartPage + 1 <= totalPages) {
      panCamera('right')
      return
    }
    if (cameraSide === 'right' && spreadStartPage + 2 <= totalPages) beginNativeTurn('next')
  }

  const moveToPreviousStep = () => {
    if (isTurning || coverClosing || cameraAnimating || currentPage <= 1) return
    if (cameraSide === 'right') {
      panCamera('left')
      return
    }
    if (spreadStartPage <= 2) {
      closeCover()
      return
    }
    beginNativeTurn('prev')
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (nativeFallbackTimerRef.current) window.clearTimeout(nativeFallbackTimerRef.current)
      if (cameraTimerRef.current) window.clearTimeout(cameraTimerRef.current)
      nativeTurnRef.current = null
      nativeFlipStartedRef.current = false
      setIsTurning(false)
      setCoverClosing(false)
      setCameraAnimating(false)
      setCameraSide(target > 1 && target % 2 === 1 ? 'right' : 'left')
      onPageChange?.(target)
    },
    next() { moveToNextStep() },
    previous() { moveToPreviousStep() },
  }))

  const handlePointerDown = (event) => {
    if (isTurning || coverClosing || cameraAnimating) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: performance.now(),
      locked: null,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    if (gesture.locked === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.02 ? 'horizontal' : 'vertical'
    }
    if (gesture.locked === 'horizontal') event.preventDefault?.()
  }

  const handlePointerEnd = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal') return

    const dx = event.clientX - gesture.startX
    const elapsed = Math.max(1, performance.now() - gesture.startTime)
    const velocity = dx / elapsed
    const threshold = Math.max(28, pageWidth * 0.10)
    const swipeLeft = dx <= -threshold || velocity <= -0.28
    const swipeRight = dx >= threshold || velocity >= 0.28

    if (currentPage === 1) {
      if (swipeLeft) openCover()
      return
    }

    if (cameraSide === 'left') {
      if (swipeLeft) panCamera('right')
      else if (swipeRight) {
        if (spreadStartPage <= 2) closeCover()
        else beginNativeTurn('prev')
      }
      return
    }

    if (cameraSide === 'right') {
      if (swipeRight) panCamera('left')
      else if (swipeLeft && spreadStartPage + 2 <= totalPages) beginNativeTurn('next')
    }
  }

  const handleFlipState = (event) => {
    const state = event.data
    if (state === 'flipping') nativeFlipStartedRef.current = true
    if (state === 'read' && nativeTurnRef.current && nativeFlipStartedRef.current) finishNativeTurn()
  }

  if (currentPage === 1) {
    return (
      <>
        <style>{MOBILE_COVER_CSS}</style>
        <div
          className={`sedco-native-viewer is-cover${isTurning ? ' is-turning' : ''}`}
          style={{ '--sedco-native-page-w': `${pageWidth}px`, '--sedco-native-page-h': `${pageHeight}px`, '--sedco-native-peek-w': `${peekWidth}px` }}
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
              <div className="sedco-native-cover-under"><img src={pageImage(2)} alt="" draggable="false" /></div>
              <div ref={coverSheetRef} className="sedco-native-cover-sheet">
                <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--front"><img src={pageImage(1)} alt="" draggable="false" /></div>
                <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--back" />
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{MOBILE_COVER_CSS}</style>
      <style>{MOBILE_LAPTOP_FLIP_CSS}</style>
      <div
        className={`sedco-native-viewer is-open-book is-camera-${cameraSide}${isTurning ? ' is-turning' : ''}`}
        style={{ '--sedco-native-page-w': `${pageWidth}px`, '--sedco-native-page-h': `${pageHeight}px`, '--sedco-native-peek-w': `${peekWidth}px`, '--sedco-native-camera-travel': `${cameraTravel}px` }}
        aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="sedco-native-camera-window">
          <div
            className="sedco-native-camera-track"
            style={{
              transform: `translate3d(${cameraX}px,0,0)`,
              transition: isTurning ? 'none' : `transform ${CAMERA_FULL_MS}ms cubic-bezier(.22,.82,.24,1)`,
            }}
          >
            <div className="sedco-native-spread-bed" aria-hidden="true" />
            <StaticSpread leftPage={spreadStartPage} rightPage={spreadStartPage + 1} totalPages={totalPages} />

            {coverClosing && (
              <div className="sedco-native-cover-closing-stage" aria-hidden="true">
                <div ref={closingCoverSheetRef} className="sedco-native-cover-sheet" style={{ transform: 'perspective(1900px) rotateY(-180deg) translateZ(1px)' }}>
                  <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--front"><img src={pageImage(1)} alt="" draggable="false" /></div>
                  <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--back" />
                </div>
              </div>
            )}

            <HTMLFlipBook
              key={`native-spread-${spreadStartPage}-${pageWidth}`}
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
              flippingTime={PAGE_FLIP_MS}
              usePortrait={false}
              startZIndex={40}
              autoSize={false}
              maxShadowOpacity={0.34}
              showCover={false}
              mobileScrollSupport={false}
              clickEventForward={false}
              useMouseEvents={false}
              swipeDistance={28}
              showPageCorners
              disableFlipByClick
              className="sedco-native-flipbook sedco-native-spread-flipbook"
              onChangeState={handleFlipState}
            >
              {Array.from({ length: totalPages - 1 }, (_, index) => (
                <SedcoPage page={index + 2} totalPages={totalPages} key={index + 2} />
              ))}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </>
  )
})

export default MobileImpactSlider
