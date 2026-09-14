import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  }

  .sedco-native-turn-sheet--prev {
    left: 0;
    transform-origin: right center;
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
}
`

const MOBILE_COVER_FLIP_CSS = `
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

  .sedco-native-cover-sheet.is-opening {
    animation: sedco-mobile-cover-open 860ms linear both;
  }

  .sedco-native-cover-sheet.is-closing {
    animation: sedco-mobile-cover-close 860ms linear both;
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
    0% { transform: rotateY(0deg) translateZ(1px); filter: drop-shadow(0 7px 10px rgba(0,0,0,.12)); }
    8% { transform: rotateY(-2deg) translateZ(1.5px); filter: drop-shadow(1px 7px 10.5px rgba(0,0,0,.125)); }
    18% { transform: rotateY(-10deg) translateZ(2.5px); filter: drop-shadow(3px 8px 12px rgba(0,0,0,.14)); }
    30% { transform: rotateY(-28deg) translateZ(4px); filter: drop-shadow(5px 8.5px 14px rgba(0,0,0,.16)); }
    42% { transform: rotateY(-55deg) translateZ(6px); filter: drop-shadow(8px 8.5px 17px rgba(0,0,0,.19)); }
    50% { transform: rotateY(-90deg) translateZ(7px); filter: drop-shadow(11px 8px 19px rgba(0,0,0,.21)); }
    58% { transform: rotateY(-125deg) translateZ(6px); filter: drop-shadow(8px 8.5px 17px rgba(0,0,0,.19)); }
    70% { transform: rotateY(-152deg) translateZ(4px); filter: drop-shadow(5px 8px 14px rgba(0,0,0,.16)); }
    82% { transform: rotateY(-170deg) translateZ(2.5px); filter: drop-shadow(3px 7px 11px rgba(0,0,0,.12)); }
    92% { transform: rotateY(-178deg) translateZ(1.5px); filter: drop-shadow(1px 5px 8px rgba(0,0,0,.09)); }
    100% { transform: rotateY(-180deg) translateZ(1px); filter: drop-shadow(0 3px 7px rgba(0,0,0,.08)); }
  }

  @keyframes sedco-mobile-cover-close {
    0% { transform: rotateY(-180deg) translateZ(1px); filter: drop-shadow(0 3px 7px rgba(0,0,0,.08)); }
    8% { transform: rotateY(-178deg) translateZ(1.5px); filter: drop-shadow(1px 5px 8px rgba(0,0,0,.09)); }
    18% { transform: rotateY(-170deg) translateZ(2.5px); filter: drop-shadow(3px 7px 11px rgba(0,0,0,.12)); }
    30% { transform: rotateY(-152deg) translateZ(4px); filter: drop-shadow(5px 8px 14px rgba(0,0,0,.16)); }
    42% { transform: rotateY(-125deg) translateZ(6px); filter: drop-shadow(8px 8.5px 17px rgba(0,0,0,.19)); }
    50% { transform: rotateY(-90deg) translateZ(7px); filter: drop-shadow(11px 8px 19px rgba(0,0,0,.21)); }
    58% { transform: rotateY(-55deg) translateZ(6px); filter: drop-shadow(8px 8.5px 17px rgba(0,0,0,.19)); }
    70% { transform: rotateY(-28deg) translateZ(4px); filter: drop-shadow(5px 8.5px 14px rgba(0,0,0,.16)); }
    82% { transform: rotateY(-10deg) translateZ(2.5px); filter: drop-shadow(3px 8px 12px rgba(0,0,0,.14)); }
    92% { transform: rotateY(-2deg) translateZ(1.5px); filter: drop-shadow(1px 7px 10.5px rgba(0,0,0,.125)); }
    100% { transform: rotateY(0deg) translateZ(1px); filter: drop-shadow(0 7px 10px rgba(0,0,0,.12)); }
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

const TurningSheet = forwardRef(function TurningSheet({ sheet }, ref) {
  if (!sheet) return null

  return (
    <div
      ref={ref}
      className={`sedco-native-turn-sheet sedco-native-turn-sheet--${sheet.direction}`}
      aria-hidden="true"
    >
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
})

function ClosingCoverSheet({ active }) {
  if (!active) return null

  return (
    <div className="sedco-native-cover-closing-stage" aria-hidden="true">
      <div className="sedco-native-cover-sheet is-closing">
        <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--front">
          <img src={pageImage(1)} alt="" draggable="false" />
        </div>
        <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--back" />
      </div>
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
  const turnSheetRef = useRef(null)
  const gestureRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const turnTimerRef = useRef(null)
  const turnRafRef = useRef(null)
  const turnProgressRef = useRef(0)
  const pendingAutoTurnRef = useRef(null)
  const cameraSlideTimerRef = useRef(null)

  const [isTurning, setIsTurning] = useState(false)
  const [turnSheet, setTurnSheet] = useState(null)
  const [coverClosing, setCoverClosing] = useState(false)
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
    if (turnRafRef.current) window.cancelAnimationFrame(turnRafRef.current)
    if (cameraSlideTimerRef.current) window.clearTimeout(cameraSlideTimerRef.current)
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
    if (currentPage <= 1 || turnSheet || coverClosing || cameraSlideTimerRef.current) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage, turnSheet, coverClosing])

  const setCameraTransform = (x, animate = true, transition = null) => {
    if (!cameraRef.current) return
    cameraRef.current.style.transition = animate
      ? (transition || 'transform 420ms cubic-bezier(.22,.82,.24,1)')
      : 'none'
    cameraRef.current.style.transform = `translate3d(${x}px,0,0)`
  }

  const snapCamera = (side, animate = true) => {
    const x = side === 'right' ? cameraRightX : cameraLeftX
    setCameraSide(side)
    setCameraTransform(x, animate)
  }

  const slideCameraBack = () => {
    if (cameraSlideTimerRef.current) window.clearTimeout(cameraSlideTimerRef.current)

    setCameraSide('left')
    setCameraTransform(
      cameraLeftX,
      true,
      'transform 420ms cubic-bezier(.22,.82,.24,1)',
    )

    cameraSlideTimerRef.current = window.setTimeout(() => {
      cameraSlideTimerRef.current = null
    }, 430)

    onPageChange?.(spreadStartPage)
  }

  const applyTurnProgress = (direction, rawProgress) => {
    const progress = clamp(rawProgress, 0, 1)
    turnProgressRef.current = progress

    const angle = Math.PI * progress
    const degrees = 180 * progress
    const rotation = direction === 'next' ? -degrees : degrees
    const lift = 1 + 7 * Math.sin(angle)
    const tilt = (direction === 'next' ? -1 : 1) * 0.22 * Math.sin(angle)
    const shadowX = (direction === 'next' ? 1 : -1) * 11 * Math.sin(angle)
    const shadowBlur = 8 + 10 * Math.sin(angle)
    const shadowAlpha = 0.08 + 0.13 * Math.sin(angle)

    const sheet = turnSheetRef.current
    if (sheet) {
      sheet.style.setProperty('animation', 'none', 'important')
      sheet.style.transform = `perspective(1900px) rotateY(${rotation}deg) rotateZ(${tilt}deg) translateZ(${lift}px)`
      sheet.style.filter = `drop-shadow(${shadowX}px 8px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}))`
    }

    const cameraFactor = direction === 'next'
      ? (1 + Math.cos(angle)) / 2
      : (1 - Math.cos(angle)) / 2

    setCameraTransform(-cameraTravel * cameraFactor, false)
  }

  const spreadFlip = () => spreadFlipRef.current?.pageFlip?.()

  const makeTurnSheet = (direction) => {
    const isNext = direction === 'next'
    const destinationStart = isNext ? spreadStartPage + 2 : spreadStartPage - 2

    return isNext
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
  }

  const resetTurnSound = () => {
    soundPlayedRef.current = false
  }

  const startTurnSound = () => {
    if (soundPlayedRef.current) return
    onPageTurn?.()
    soundPlayedRef.current = true
  }

  const finalizeOpenBookTurn = (sheet) => {
    const isNext = sheet.direction === 'next'
    const destinationSide = isNext ? 'left' : 'right'
    const destinationPage = isNext
      ? sheet.destinationStart
      : Math.min(totalPages, sheet.destinationStart + 1)

    spreadFlip()?.turnToPage(Math.max(0, sheet.destinationStart - 2))
    snapCamera(destinationSide, false)
    onPageChange?.(destinationPage)
    setTurnSheet(null)
    setIsTurning(false)
    turnProgressRef.current = 0
    resetTurnSound()
  }

  const cancelOpenBookTurn = (sheet) => {
    snapCamera(sheet.direction === 'next' ? 'right' : 'left', false)
    setTurnSheet(null)
    setIsTurning(false)
    turnProgressRef.current = 0
    resetTurnSound()
  }

  const animateTurnProgress = (sheet, target, onDone) => {
    if (turnRafRef.current) window.cancelAnimationFrame(turnRafRef.current)

    const start = turnProgressRef.current
    const distance = Math.abs(target - start)
    if (distance < 0.001) {
      applyTurnProgress(sheet.direction, target)
      onDone?.()
      return
    }

    const duration = Math.max(170, 860 * distance)
    const startedAt = performance.now()

    const tick = (now) => {
      const elapsed = clamp((now - startedAt) / duration, 0, 1)
      const eased = target > start
        ? 1 - Math.pow(1 - elapsed, 3)
        : Math.pow(elapsed, 3)
      const progress = start + (target - start) * eased

      applyTurnProgress(sheet.direction, progress)

      if (elapsed < 1) {
        turnRafRef.current = window.requestAnimationFrame(tick)
      } else {
        turnRafRef.current = null
        applyTurnProgress(sheet.direction, target)
        onDone?.()
      }
    }

    turnRafRef.current = window.requestAnimationFrame(tick)
  }

  const mountOpenBookTurn = (direction, autoComplete = false) => {
    if (isTurning) return null

    const sheet = makeTurnSheet(direction)
    turnProgressRef.current = 0
    pendingAutoTurnRef.current = autoComplete ? sheet : null
    setTurnSheet(sheet)
    setIsTurning(true)
    startTurnSound()
    return sheet
  }

  useLayoutEffect(() => {
    if (!turnSheet) return

    applyTurnProgress(turnSheet.direction, turnProgressRef.current)

    if (
      pendingAutoTurnRef.current
      && pendingAutoTurnRef.current.direction === turnSheet.direction
      && pendingAutoTurnRef.current.destinationStart === turnSheet.destinationStart
    ) {
      pendingAutoTurnRef.current = null
      const frame = window.requestAnimationFrame(() => {
        animateTurnProgress(turnSheet, 1, () => finalizeOpenBookTurn(turnSheet))
      })
      return () => window.cancelAnimationFrame(frame)
    }
  }, [turnSheet])

  useEffect(() => {
    if (currentPage <= 1 || turnSheet || coverClosing) return
    requestAnimationFrame(() => {
      snapCamera(currentPage % 2 === 1 ? 'right' : 'left', false)
    })
  }, [pageWidth])

  const beginCoverTurn = () => {
    if (isTurning || currentPage !== 1) return

    setIsTurning(true)
    startTurnSound()

    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current)
    turnTimerRef.current = window.setTimeout(() => {
      setIsTurning(false)
      resetTurnSound()
      turnTimerRef.current = null
      onPageChange?.(2)
    }, 860)
  }

  const beginCoverClose = () => {
    if (isTurning || currentPage <= 1 || spreadStartPage > 2 || cameraSide !== 'left') return

    setCoverClosing(true)
    setIsTurning(true)
    startTurnSound()

    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current)
    turnTimerRef.current = window.setTimeout(() => {
      setCoverClosing(false)
      setIsTurning(false)
      resetTurnSound()
      turnTimerRef.current = null
      onPageChange?.(1)
    }, 860)
  }

  const beginOpenBookTurn = (direction) => {
    mountOpenBookTurn(direction, true)
  }

  const moveToNextStep = () => {
    if (isTurning || cameraSlideTimerRef.current) return

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
    if (isTurning || cameraSlideTimerRef.current || currentPage <= 1) return

    if (cameraSide === 'right') {
      slideCameraBack()
      return
    }

    if (spreadStartPage <= 2) {
      beginCoverClose()
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
    if (isTurning || cameraSlideTimerRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const now = performance.now()
    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startTime: now,
      lastX: event.clientX,
      lastTime: now,
      locked: null,
      turnDirection: null,
      turnSheet: null,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (isTurning && !gesture.turnDirection) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    const now = performance.now()

    if (gesture.locked === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.05 ? 'horizontal' : 'vertical'
    }

    if (gesture.locked !== 'horizontal') return

    if (gesture.turnDirection && gesture.turnSheet) {
      const distance = gesture.turnDirection === 'next' ? -dx : dx
      const progress = clamp(distance / (spreadPageWidth * 0.78), 0, 1)
      applyTurnProgress(gesture.turnDirection, progress)
      gesture.lastX = event.clientX
      gesture.lastTime = now
      return
    }

    if (currentPage > 1 && cameraSide === 'left' && dx < 0) {
      setCameraTransform(clamp(cameraLeftX + dx, cameraRightX, cameraLeftX), false)
      gesture.lastX = event.clientX
      gesture.lastTime = now
      return
    }

    if (currentPage > 1 && cameraSide === 'right' && dx > 0) {
      setCameraTransform(clamp(cameraRightX + dx, cameraRightX, cameraLeftX), false)
      gesture.lastX = event.clientX
      gesture.lastTime = now
      return
    }

    if (
      currentPage > 1
      && cameraSide === 'right'
      && dx < -5
      && spreadStartPage + 2 <= totalPages
    ) {
      const sheet = mountOpenBookTurn('next', false)
      if (sheet) {
        gesture.turnDirection = 'next'
        gesture.turnSheet = sheet
        const progress = clamp((-dx) / (spreadPageWidth * 0.78), 0, 1)
        turnProgressRef.current = progress
        requestAnimationFrame(() => applyTurnProgress('next', progress))
      }
      gesture.lastX = event.clientX
      gesture.lastTime = now
      return
    }

    if (
      currentPage > 1
      && cameraSide === 'left'
      && dx > 5
      && spreadStartPage > 2
    ) {
      const sheet = mountOpenBookTurn('prev', false)
      if (sheet) {
        gesture.turnDirection = 'prev'
        gesture.turnSheet = sheet
        const progress = clamp(dx / (spreadPageWidth * 0.78), 0, 1)
        turnProgressRef.current = progress
        requestAnimationFrame(() => applyTurnProgress('prev', progress))
      }
      gesture.lastX = event.clientX
      gesture.lastTime = now
    }
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
    const threshold = Math.max(34, spreadPageWidth * 0.14)

    if (gesture.turnDirection && gesture.turnSheet) {
      const progress = turnProgressRef.current
      const forwardVelocity = gesture.turnDirection === 'next' ? -velocity : velocity
      const shouldComplete = progress >= 0.22 || forwardVelocity >= 0.34

      if (shouldComplete) {
        animateTurnProgress(
          gesture.turnSheet,
          1,
          () => finalizeOpenBookTurn(gesture.turnSheet),
        )
      } else {
        animateTurnProgress(
          gesture.turnSheet,
          0,
          () => cancelOpenBookTurn(gesture.turnSheet),
        )
      }
      return
    }

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
      <style>{MOBILE_COVER_FLIP_CSS}</style>
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

            <TurningSheet ref={turnSheetRef} sheet={turnSheet} />
            <ClosingCoverSheet active={coverClosing} />

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
