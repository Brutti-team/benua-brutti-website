import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-sedco-native.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const CAMERA_FULL_MS = 420
const TURN_FULL_MS = 800
const COVER_FULL_MS = 780
const GESTURE_PAGE_DISTANCE = 0.68

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
    box-shadow: inset -10px 0 18px rgba(0,0,0,.025), 0 8px 24px rgba(0,0,0,.18);
  }
  .sedco-native-turn-sheet__face--back {
    transform: rotateY(180deg) translateZ(.7px);
    box-shadow: inset 12px 0 22px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.16);
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
    opacity: .34;
    background: linear-gradient(90deg, rgba(0,0,0,.025), transparent 18%, transparent 72%, rgba(0,0,0,.11));
  }
  .sedco-native-turn-sheet__curl {
    z-index: 6;
    width: 21px;
    opacity: .84;
  }
  .sedco-native-turn-sheet--next .sedco-native-turn-sheet__curl {
    right: -1px;
    background: linear-gradient(90deg, rgba(0,0,0,0), rgba(0,0,0,.095) 48%, rgba(255,255,255,.84) 75%, rgba(0,0,0,.06));
  }
  .sedco-native-turn-sheet--prev .sedco-native-turn-sheet__curl {
    left: -1px;
    background: linear-gradient(90deg, rgba(0,0,0,.06), rgba(255,255,255,.84) 25%, rgba(0,0,0,.095) 52%, rgba(0,0,0,0));
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
  .sedco-native-cover-sheet__face--back::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(0,0,0,.055), rgba(0,0,0,.012) 16%, transparent 42%, rgba(255,255,255,.18));
  }
}
`

const SedcoPage = forwardRef(function SedcoPage({ page, totalPages, forceSoft = false }, ref) {
  const isCover = !forceSoft && (page === 1 || page === totalPages)
  return (
    <div ref={ref} className={`sedco-native-page${isCover ? ' sedco-native-page--cover' : ''}`} data-density={isCover ? 'hard' : 'soft'}>
      <img src={pageImage(page)} alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`} draggable="false" decoding="async" loading={page <= 5 ? 'eager' : 'lazy'} fetchPriority={page <= 2 ? 'high' : 'auto'} />
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

const TurningSheet = forwardRef(function TurningSheet({ sheet }, ref) {
  if (!sheet) return null
  return (
    <div ref={ref} className={`sedco-native-turn-sheet sedco-native-turn-sheet--${sheet.direction}`} aria-hidden="true">
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

const ClosingCoverSheet = forwardRef(function ClosingCoverSheet({ active }, ref) {
  if (!active) return null
  return (
    <div className="sedco-native-cover-closing-stage" aria-hidden="true">
      <div ref={ref} className="sedco-native-cover-sheet">
        <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--front"><img src={pageImage(1)} alt="" draggable="false" /></div>
        <div className="sedco-native-cover-sheet__face sedco-native-cover-sheet__face--back" />
      </div>
    </div>
  )
})

const MobileImpactSlider = forwardRef(function MobileImpactSlider({ totalPages, currentPage, onPageChange, onPageTurn }, ref) {
  const spreadFlipRef = useRef(null)
  const cameraRef = useRef(null)
  const turnSheetRef = useRef(null)
  const coverSheetRef = useRef(null)
  const gestureRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const turnRafRef = useRef(null)
  const coverRafRef = useRef(null)
  const turnProgressRef = useRef(0)
  const coverProgressRef = useRef(0)
  const coverDirectionRef = useRef(null)
  const pendingAutoTurnRef = useRef(null)
  const cameraSlideTimerRef = useRef(null)
  const cameraXRef = useRef(0)

  const [isTurning, setIsTurning] = useState(false)
  const [turnSheet, setTurnSheet] = useState(null)
  const [coverClosing, setCoverClosing] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 390 : window.innerWidth))
  const [cameraSide, setCameraSide] = useState(() => (currentPage > 1 && currentPage % 2 === 1 ? 'right' : 'left'))

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', sync, { passive: true })
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => () => {
    if (turnRafRef.current) window.cancelAnimationFrame(turnRafRef.current)
    if (coverRafRef.current) window.cancelAnimationFrame(coverRafRef.current)
    if (cameraSlideTimerRef.current) window.clearTimeout(cameraSlideTimerRef.current)
  }, [])

  const coverPageWidth = useMemo(() => Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80))), [viewportWidth])
  const spreadPageWidth = useMemo(() => Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80))), [viewportWidth])
  const pageWidth = currentPage === 1 ? coverPageWidth : spreadPageWidth
  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])
  const cameraTravel = currentPage === 1 ? 0 : Math.max(0, spreadPageWidth - peekWidth)
  const cameraLeftX = 0
  const cameraRightX = -cameraTravel
  const spreadStartPage = currentPage <= 1 ? 2 : currentPage % 2 === 0 ? currentPage : currentPage - 1

  useEffect(() => {
    if (currentPage <= 1 || turnSheet || coverClosing || cameraSlideTimerRef.current) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage, turnSheet, coverClosing])

  const setCameraTransform = (x, animate = true, duration = CAMERA_FULL_MS) => {
    cameraXRef.current = x
    if (!cameraRef.current) return
    cameraRef.current.style.transition = animate ? `transform ${duration}ms cubic-bezier(.22,.82,.24,1)` : 'none'
    cameraRef.current.style.transform = `translate3d(${x}px,0,0)`
  }

  const clearCameraTimer = () => {
    if (!cameraSlideTimerRef.current) return
    window.clearTimeout(cameraSlideTimerRef.current)
    cameraSlideTimerRef.current = null
  }

  const snapCamera = (side, animate = true, duration = CAMERA_FULL_MS) => {
    const x = side === 'right' ? cameraRightX : cameraLeftX
    setCameraSide(side)
    setCameraTransform(x, animate, duration)
  }

  const settleCamera = (side, { fromGesture = false, updatePage = true } = {}) => {
    clearCameraTimer()
    const targetX = side === 'right' ? cameraRightX : cameraLeftX
    const remaining = Math.abs(targetX - cameraXRef.current)
    const remainingRatio = cameraTravel > 0 ? clamp(remaining / cameraTravel, 0, 1) : 0
    const duration = fromGesture ? Math.max(90, Math.round(300 * remainingRatio)) : CAMERA_FULL_MS
    setCameraTransform(targetX, true, duration)
    cameraSlideTimerRef.current = window.setTimeout(() => {
      setCameraSide(side)
      if (updatePage) onPageChange?.(side === 'right' ? Math.min(totalPages, spreadStartPage + 1) : spreadStartPage)
      cameraSlideTimerRef.current = null
    }, duration + 12)
  }

  const applyTurnProgress = (direction, rawProgress) => {
    const progress = clamp(rawProgress, 0, 1)
    turnProgressRef.current = progress

    // Match the reference-book feel: the page does not behave like one rigid
    // card. Its free edge peels first, the fold travels toward the spine, and
    // the sheet briefly compresses while it is most curved.
    const eased = 0.5 - (Math.cos(Math.PI * progress) / 2)
    const bend = Math.sin(Math.PI * progress)
    const paperBend = Math.pow(Math.max(0, bend), 0.82)
    const degrees = 180 * eased
    const rotation = direction === 'next' ? -degrees : degrees
    const scaleX = 1 - (0.085 * paperBend)
    const lift = 1 + (11 * paperBend)
    const radius = 2 + (22 * paperBend)
    const foldWidth = 18 + (44 * paperBend)
    const foldOpacity = 0.08 + (0.78 * paperBend)
    const foldX = direction === 'next' ? 100 - (eased * 100) : eased * 100

    const sheet = turnSheetRef.current
    if (sheet) {
      sheet.style.setProperty('animation', 'none', 'important')
      sheet.style.setProperty('--sedco-turn-fold-x', `${foldX.toFixed(2)}%`)
      sheet.style.setProperty('--sedco-turn-fold-width', `${foldWidth.toFixed(2)}px`)
      sheet.style.setProperty('--sedco-turn-fold-opacity', foldOpacity.toFixed(3))
      sheet.style.setProperty('--sedco-turn-radius', `${radius.toFixed(2)}px`)
      sheet.style.transform = `perspective(1550px) rotateY(${rotation}deg) scaleX(${scaleX}) translateZ(${lift}px)`
      sheet.style.filter = 'none'
    }

    const angle = Math.PI * eased
    const cameraFactor = direction === 'next' ? (1 + Math.cos(angle)) / 2 : (1 - Math.cos(angle)) / 2
    setCameraTransform(-cameraTravel * cameraFactor, false)
  }

  const applyCoverProgress = (direction, rawProgress) => {
    const progress = clamp(rawProgress, 0, 1)
    coverProgressRef.current = progress
    const curved = progress * progress * (3 - 2 * progress)
    const angle = Math.PI * curved
    const degrees = 180 * curved
    const bend = Math.sin(angle)
    const rotation = direction === 'open' ? -degrees : -180 + degrees
    const lift = 1 + 7 * bend
    const shadowX = (direction === 'open' ? 1 : -1) * 10 * bend
    const sheet = coverSheetRef.current
    if (!sheet) return
    sheet.style.setProperty('animation', 'none', 'important')
    sheet.style.transform = `perspective(1900px) rotateY(${rotation}deg) translateZ(${lift}px)`
    sheet.style.filter = `drop-shadow(${shadowX}px 8px ${8 + 11 * bend}px rgba(0,0,0,${0.08 + 0.13 * bend}))`
  }

  const spreadFlip = () => spreadFlipRef.current?.pageFlip?.()

  const makeTurnSheet = (direction) => {
    const isNext = direction === 'next'
    const destinationStart = isNext ? spreadStartPage + 2 : spreadStartPage - 2
    return isNext
      ? { direction: 'next', frontPage: Math.min(totalPages, spreadStartPage + 1), backPage: Math.min(totalPages, destinationStart), destinationStart }
      : { direction: 'prev', frontPage: spreadStartPage, backPage: Math.max(1, spreadStartPage - 1), destinationStart }
  }

  const resetTurnSound = () => { soundPlayedRef.current = false }
  const startTurnSound = () => {
    if (soundPlayedRef.current) return
    onPageTurn?.()
    soundPlayedRef.current = true
  }

  const finalizeOpenBookTurn = (sheet) => {
    const isNext = sheet.direction === 'next'
    const destinationSide = isNext ? 'left' : 'right'
    const destinationPage = isNext ? sheet.destinationStart : Math.min(totalPages, sheet.destinationStart + 1)
    spreadFlip()?.turnToPage(Math.max(0, sheet.destinationStart - 2))
    snapCamera(destinationSide, false, 0)
    onPageChange?.(destinationPage)
    setTurnSheet(null)
    setIsTurning(false)
    turnProgressRef.current = 0
    resetTurnSound()
  }

  const cancelOpenBookTurn = (sheet) => {
    snapCamera(sheet.direction === 'next' ? 'right' : 'left', false, 0)
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
    const duration = Math.max(125, TURN_FULL_MS * distance)
    const startedAt = performance.now()
    const tick = (now) => {
      const elapsed = clamp((now - startedAt) / duration, 0, 1)
      const progress = start + (target - start) * elapsed
      applyTurnProgress(sheet.direction, progress)
      if (elapsed < 1) turnRafRef.current = window.requestAnimationFrame(tick)
      else {
        turnRafRef.current = null
        applyTurnProgress(sheet.direction, target)
        onDone?.()
      }
    }
    turnRafRef.current = window.requestAnimationFrame(tick)
  }

  const animateCoverProgress = (direction, target, onDone) => {
    if (coverRafRef.current) window.cancelAnimationFrame(coverRafRef.current)
    const start = coverProgressRef.current
    const distance = Math.abs(target - start)
    if (distance < 0.001) {
      applyCoverProgress(direction, target)
      onDone?.()
      return
    }
    const duration = Math.max(125, COVER_FULL_MS * distance)
    const startedAt = performance.now()
    const tick = (now) => {
      const elapsed = clamp((now - startedAt) / duration, 0, 1)
      const progress = start + (target - start) * elapsed
      applyCoverProgress(direction, progress)
      if (elapsed < 1) coverRafRef.current = window.requestAnimationFrame(tick)
      else {
        coverRafRef.current = null
        applyCoverProgress(direction, target)
        onDone?.()
      }
    }
    coverRafRef.current = window.requestAnimationFrame(tick)
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
    if (pendingAutoTurnRef.current && pendingAutoTurnRef.current.direction === turnSheet.direction && pendingAutoTurnRef.current.destinationStart === turnSheet.destinationStart) {
      pendingAutoTurnRef.current = null
      const frame = window.requestAnimationFrame(() => animateTurnProgress(turnSheet, 1, () => finalizeOpenBookTurn(turnSheet)))
      return () => window.cancelAnimationFrame(frame)
    }
  }, [turnSheet])

  useEffect(() => {
    if (currentPage <= 1 || turnSheet || coverClosing || cameraSlideTimerRef.current) return
    requestAnimationFrame(() => {
      const side = currentPage % 2 === 1 ? 'right' : 'left'
      const x = side === 'right' ? cameraRightX : cameraLeftX
      cameraXRef.current = x
      snapCamera(side, false, 0)
    })
  }, [pageWidth])

  const finishCoverOpen = () => {
    coverDirectionRef.current = null
    coverProgressRef.current = 0
    setIsTurning(false)
    resetTurnSound()
    onPageChange?.(2)
  }

  const cancelCoverOpen = () => {
    coverDirectionRef.current = null
    coverProgressRef.current = 0
    setIsTurning(false)
    resetTurnSound()
    applyCoverProgress('open', 0)
  }

  const finishCoverClose = () => {
    coverDirectionRef.current = null
    coverProgressRef.current = 0
    setCoverClosing(false)
    setIsTurning(false)
    resetTurnSound()
    onPageChange?.(1)
  }

  const cancelCoverClose = () => {
    coverDirectionRef.current = null
    coverProgressRef.current = 0
    setCoverClosing(false)
    setIsTurning(false)
    resetTurnSound()
  }

  const beginCoverTurn = () => {
    if (isTurning || currentPage !== 1) return
    coverDirectionRef.current = 'open'
    coverProgressRef.current = 0
    setIsTurning(true)
    startTurnSound()
    requestAnimationFrame(() => animateCoverProgress('open', 1, finishCoverOpen))
  }

  const beginCoverClose = () => {
    if (isTurning || currentPage <= 1 || spreadStartPage > 2 || cameraSide !== 'left') return
    coverDirectionRef.current = 'close'
    coverProgressRef.current = 0
    setCoverClosing(true)
    setIsTurning(true)
    startTurnSound()
    requestAnimationFrame(() => requestAnimationFrame(() => animateCoverProgress('close', 1, finishCoverClose)))
  }

  const beginOpenBookTurn = (direction) => { mountOpenBookTurn(direction, true) }

  const moveToNextStep = () => {
    if (isTurning || cameraSlideTimerRef.current) return
    if (currentPage === 1) {
      beginCoverTurn()
      return
    }
    if (cameraSide === 'left' && spreadStartPage + 1 <= totalPages) {
      settleCamera('right', { fromGesture: false })
      return
    }
    if (cameraSide === 'right' && spreadStartPage + 2 <= totalPages) beginOpenBookTurn('next')
  }

  const moveToPreviousStep = () => {
    if (isTurning || cameraSlideTimerRef.current || currentPage <= 1) return
    if (cameraSide === 'right') {
      settleCamera('left', { fromGesture: false })
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
      clearCameraTimer()
      if (target === 1) {
        onPageChange?.(1)
        return
      }
      const spread = target % 2 === 0 ? target : target - 1
      const side = target % 2 === 1 ? 'right' : 'left'
      spreadFlip()?.turnToPage(Math.max(0, spread - 2))
      requestAnimationFrame(() => {
        snapCamera(side, false, 0)
        onPageChange?.(target)
      })
    },
    next() { moveToNextStep() },
    previous() { moveToPreviousStep() },
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
      startCameraX: cameraXRef.current,
      startSide: cameraSide,
      lastX: event.clientX,
      lastTime: now,
      velocityX: 0,
      locked: null,
      turnDirection: null,
      turnSheet: null,
      coverDirection: null,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const updateGestureVelocity = (gesture, event, now) => {
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    if (isTurning && !gesture.turnDirection && !gesture.coverDirection) return
    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY
    const now = performance.now()

    if (gesture.locked === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.02 ? 'horizontal' : 'vertical'
    }
    if (gesture.locked !== 'horizontal') {
      updateGestureVelocity(gesture, event, now)
      return
    }
    event.preventDefault?.()

    if (gesture.coverDirection) {
      const distance = gesture.coverDirection === 'open' ? -dx : dx
      applyCoverProgress(gesture.coverDirection, distance / (pageWidth * GESTURE_PAGE_DISTANCE))
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (gesture.turnDirection && gesture.turnSheet) {
      const distance = gesture.turnDirection === 'next' ? -dx : dx
      applyTurnProgress(gesture.turnDirection, distance / (spreadPageWidth * GESTURE_PAGE_DISTANCE))
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage === 1 && dx < -4) {
      gesture.coverDirection = 'open'
      coverDirectionRef.current = 'open'
      coverProgressRef.current = 0
      setIsTurning(true)
      startTurnSound()
      requestAnimationFrame(() => applyCoverProgress('open', (-dx) / (pageWidth * GESTURE_PAGE_DISTANCE)))
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage > 1 && gesture.startSide === 'left' && spreadStartPage <= 2 && dx > 4) {
      gesture.coverDirection = 'close'
      coverDirectionRef.current = 'close'
      coverProgressRef.current = clamp(dx / (pageWidth * GESTURE_PAGE_DISTANCE), 0, 1)
      setCoverClosing(true)
      setIsTurning(true)
      startTurnSound()
      requestAnimationFrame(() => requestAnimationFrame(() => applyCoverProgress('close', coverProgressRef.current)))
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage > 1 && gesture.startSide === 'left' && dx < 0) {
      setCameraTransform(clamp(gesture.startCameraX + dx, cameraRightX, cameraLeftX), false)
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage > 1 && gesture.startSide === 'right' && dx > 0) {
      setCameraTransform(clamp(gesture.startCameraX + dx, cameraRightX, cameraLeftX), false)
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage > 1 && gesture.startSide === 'right' && dx < -4 && spreadStartPage + 2 <= totalPages) {
      const sheet = mountOpenBookTurn('next', false)
      if (sheet) {
        gesture.turnDirection = 'next'
        gesture.turnSheet = sheet
        const progress = clamp((-dx) / (spreadPageWidth * GESTURE_PAGE_DISTANCE), 0, 1)
        turnProgressRef.current = progress
        requestAnimationFrame(() => applyTurnProgress('next', progress))
      }
      updateGestureVelocity(gesture, event, now)
      return
    }

    if (currentPage > 1 && gesture.startSide === 'left' && dx > 4 && spreadStartPage > 2) {
      const sheet = mountOpenBookTurn('prev', false)
      if (sheet) {
        gesture.turnDirection = 'prev'
        gesture.turnSheet = sheet
        const progress = clamp(dx / (spreadPageWidth * GESTURE_PAGE_DISTANCE), 0, 1)
        turnProgressRef.current = progress
        requestAnimationFrame(() => applyTurnProgress('prev', progress))
      }
      updateGestureVelocity(gesture, event, now)
      return
    }

    updateGestureVelocity(gesture, event, now)
  }

  const handlePointerEnd = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return
    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (gesture.locked !== 'horizontal') return

    const dx = event.clientX - gesture.startX
    const elapsed = Math.max(1, performance.now() - gesture.startTime)
    const averageVelocity = dx / elapsed
    const recentVelocity = gesture.velocityX
    const threshold = Math.max(28, spreadPageWidth * 0.10)

    if (gesture.coverDirection) {
      const progress = coverProgressRef.current
      const directionSign = gesture.coverDirection === 'open' ? -1 : 1
      const forwardVelocity = Math.max(recentVelocity * directionSign, averageVelocity * directionSign)
      const shouldComplete = progress >= 0.17 || forwardVelocity >= 0.25
      if (gesture.coverDirection === 'open') {
        if (shouldComplete) animateCoverProgress('open', 1, finishCoverOpen)
        else animateCoverProgress('open', 0, cancelCoverOpen)
      } else {
        if (shouldComplete) animateCoverProgress('close', 1, finishCoverClose)
        else animateCoverProgress('close', 0, cancelCoverClose)
      }
      return
    }

    if (gesture.turnDirection && gesture.turnSheet) {
      const progress = turnProgressRef.current
      const directionSign = gesture.turnDirection === 'next' ? -1 : 1
      const recentForwardVelocity = recentVelocity * directionSign
      const averageForwardVelocity = averageVelocity * directionSign
      const shouldComplete = progress >= 0.18 || recentForwardVelocity >= 0.26 || averageForwardVelocity >= 0.30
      if (shouldComplete) animateTurnProgress(gesture.turnSheet, 1, () => finalizeOpenBookTurn(gesture.turnSheet))
      else animateTurnProgress(gesture.turnSheet, 0, () => cancelOpenBookTurn(gesture.turnSheet))
      return
    }

    if (currentPage === 1) {
      if (dx <= -threshold || averageVelocity <= -0.28) beginCoverTurn()
      return
    }

    if (gesture.startSide === 'left') {
      if (dx <= -threshold || recentVelocity <= -0.24 || averageVelocity <= -0.28) settleCamera('right', { fromGesture: true })
      else settleCamera('left', { fromGesture: true, updatePage: false })
      return
    }

    if (gesture.startSide === 'right') {
      if (dx >= threshold || recentVelocity >= 0.24 || averageVelocity >= 0.28) settleCamera('left', { fromGesture: true })
      else settleCamera('right', { fromGesture: true, updatePage: false })
    }
  }

  if (currentPage === 1) {
    return (
      <>
        <style>{MOBILE_COVER_FLIP_CSS}</style>
        <div className={`sedco-native-viewer is-cover${isTurning ? ' is-turning' : ''}`} style={{ '--sedco-native-page-w': `${pageWidth}px`, '--sedco-native-page-h': `${pageHeight}px`, '--sedco-native-peek-w': `${peekWidth}px` }} aria-label={`Impact Report page ${currentPage} of ${totalPages}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
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

  const staticLeftPage = !turnSheet ? spreadStartPage : turnSheet.direction === 'next' ? spreadStartPage : turnSheet.destinationStart
  const staticRightPage = !turnSheet ? spreadStartPage + 1 : turnSheet.direction === 'next' ? turnSheet.destinationStart + 1 : spreadStartPage + 1

  return (
    <>
      <style>{MOBILE_TURN_SHEET_CSS}</style>
      <style>{MOBILE_COVER_FLIP_CSS}</style>
      <div className={`sedco-native-viewer is-open-book is-camera-${cameraSide}${isTurning ? ' is-turning' : ''}`} style={{ '--sedco-native-page-w': `${pageWidth}px`, '--sedco-native-page-h': `${pageHeight}px`, '--sedco-native-peek-w': `${peekWidth}px`, '--sedco-native-camera-travel': `${cameraTravel}px` }} aria-label={`Impact Report page ${currentPage} of ${totalPages}`} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerEnd} onPointerCancel={handlePointerEnd}>
        <div className="sedco-native-camera-window">
          <div ref={cameraRef} className="sedco-native-camera-track">
            <div className="sedco-native-spread-bed" aria-hidden="true" />
            <StaticSpread leftPage={staticLeftPage} rightPage={staticRightPage} totalPages={totalPages} />
            <TurningSheet ref={turnSheetRef} sheet={turnSheet} />
            <ClosingCoverSheet ref={coverSheetRef} active={coverClosing} />
            <HTMLFlipBook key={`spread-${pageWidth}`} ref={spreadFlipRef} width={pageWidth} height={pageHeight} size="fixed" minWidth={pageWidth} maxWidth={pageWidth} minHeight={pageHeight} maxHeight={pageHeight} startPage={Math.max(0, spreadStartPage - 2)} drawShadow flippingTime={860} usePortrait={false} startZIndex={40} autoSize={false} maxShadowOpacity={0.34} showCover={false} mobileScrollSupport={false} clickEventForward={false} useMouseEvents={false} swipeDistance={999} showPageCorners disableFlipByClick className="sedco-native-flipbook sedco-native-spread-flipbook">
              {Array.from({ length: totalPages - 1 }, (_, index) => <SedcoPage page={index + 2} totalPages={totalPages} forceSoft key={index + 2} />)}
            </HTMLFlipBook>
          </div>
        </div>
      </div>
    </>
  )
})

export default MobileImpactSlider
