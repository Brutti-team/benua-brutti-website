import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normaliseDisplayPage(page, totalPages) {
  const value = clamp(Number(page) || 1, 1, totalPages)
  if (value <= 1) return 1
  if (value >= totalPages) return totalPages
  return value % 2 === 0 ? value : value - 1
}

function ReportImage({ page, totalPages, priority = false }) {
  if (!page || page < 1 || page > totalPages) return null

  const src = `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  return (
    <img
      src={src}
      alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
      draggable="false"
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const displayPageRef = useRef(normaliseDisplayPage(currentPage, totalPages))
  const pendingEmittedPageRef = useRef(null)
  const animationRef = useRef(null)
  const gestureRef = useRef(null)

  const [displayPage, setDisplayPage] = useState(displayPageRef.current)
  const [turn, setTurn] = useState(null)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (turn) return

    const next = normaliseDisplayPage(currentPage, totalPages)

    if (pendingEmittedPageRef.current !== null) {
      if (next === pendingEmittedPageRef.current) {
        pendingEmittedPageRef.current = null
      } else {
        return
      }
    }

    displayPageRef.current = next
    setDisplayPage(next)
  }, [currentPage, totalPages, turn])

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }, [])

  const pageWidth = useMemo(() => {
    return Math.round(clamp(viewportWidth * 0.56, 218, 286))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const stageHeight = Math.round(pageHeight * 1.34)
  const coverScale = 1.34

  const nextTarget = (page = displayPageRef.current) => {
    if (page >= totalPages) return null
    if (page <= 1) return Math.min(2, totalPages)
    return Math.min(totalPages, page + 2)
  }

  const previousTarget = (page = displayPageRef.current) => {
    if (page <= 1) return null
    if (page <= 2) return 1
    if (page >= totalPages) return Math.max(2, totalPages - 2)
    return Math.max(2, page - 2)
  }

  const emitDisplayPage = (target) => {
    pendingEmittedPageRef.current = target
    displayPageRef.current = target
    setDisplayPage(target)
    onPageChange?.(target)
  }

  const commitTurn = (direction) => {
    const target = direction === 'forward' ? nextTarget() : previousTarget()
    if (!target) {
      setTurn(null)
      return
    }

    emitDisplayPage(target)
    setTurn(null)
  }

  const animateProgress = (direction, fromProgress, toProgress, commitAtEnd) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    const startedAt = performance.now()
    const distance = Math.abs(toProgress - fromProgress)
    const duration = Math.max(180, 620 * distance)

    const frame = (time) => {
      const raw = clamp((time - startedAt) / duration, 0, 1)
      const eased = 1 - Math.pow(1 - raw, 3)
      const progress = fromProgress + (toProgress - fromProgress) * eased

      setTurn({ direction, progress, interactive: false })

      if (raw < 1) {
        animationRef.current = requestAnimationFrame(frame)
        return
      }

      animationRef.current = null
      if (commitAtEnd) commitTurn(direction)
      else setTurn(null)
    }

    animationRef.current = requestAnimationFrame(frame)
  }

  const startProgrammaticTurn = (direction) => {
    if (turn || animationRef.current) return
    const target = direction === 'forward' ? nextTarget() : previousTarget()
    if (!target) return

    onPageTurn?.()
    setTurn({ direction, progress: 0, interactive: false })
    animateProgress(direction, 0, 1, true)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setTurn(null)
      const target = normaliseDisplayPage(page, totalPages)
      emitDisplayPage(target)
    },
    next() {
      startProgrammaticTurn('forward')
    },
    previous() {
      startProgrammaticTurn('backward')
    },
  }))

  const handlePointerDown = (event) => {
    if (turn || animationRef.current) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocity: 0,
      direction: null,
      progress: 0,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    const dx = event.clientX - gesture.startX
    const now = performance.now()
    const deltaTime = Math.max(1, now - gesture.lastTime)
    gesture.velocity = (event.clientX - gesture.lastX) / deltaTime
    gesture.lastX = event.clientX
    gesture.lastTime = now

    if (!gesture.direction && Math.abs(dx) > 8) {
      const direction = dx < 0 ? 'forward' : 'backward'
      const target = direction === 'forward' ? nextTarget() : previousTarget()
      if (!target) return

      gesture.direction = direction
      onPageTurn?.()
    }

    if (!gesture.direction) return

    const signedDistance = gesture.direction === 'forward' ? -dx : dx
    const progress = clamp(signedDistance / (pageWidth * 0.82), 0, 1)
    gesture.progress = progress
    setTurn({ direction: gesture.direction, progress, interactive: true })
  }

  const finishPointerGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (!gesture.direction) {
      setTurn(null)
      return
    }

    const directionalVelocity = gesture.direction === 'forward' ? -gesture.velocity : gesture.velocity
    const shouldComplete = gesture.progress > 0.22 || directionalVelocity > 0.35

    animateProgress(
      gesture.direction,
      gesture.progress,
      shouldComplete ? 1 : 0,
      shouldComplete,
    )
  }

  const isFrontCover = displayPage <= 1
  const isBackCover = displayPage >= totalPages
  const progress = turn?.progress ?? 0

  let leftPage = null
  let rightPage = null
  let flipFront = null
  let flipBack = null

  if (!turn) {
    if (isFrontCover) {
      rightPage = 1
    } else if (isBackCover) {
      leftPage = totalPages
    } else {
      leftPage = displayPage
      rightPage = Math.min(totalPages, displayPage + 1)
    }
  } else if (turn.direction === 'forward') {
    if (displayPage <= 1) {
      rightPage = Math.min(totalPages, 3)
      flipFront = 1
      flipBack = Math.min(totalPages, 2)
    } else {
      leftPage = displayPage
      rightPage = displayPage + 3 <= totalPages ? displayPage + 3 : null
      flipFront = Math.min(totalPages, displayPage + 1)
      flipBack = Math.min(totalPages, displayPage + 2)
    }
  } else if (displayPage >= totalPages) {
    leftPage = Math.max(1, totalPages - 2)
    flipFront = totalPages
    flipBack = Math.max(1, totalPages - 1)
  } else {
    leftPage = displayPage > 2 ? displayPage - 2 : null
    rightPage = Math.min(totalPages, displayPage + 1)
    flipFront = displayPage
    flipBack = displayPage <= 2 ? 1 : displayPage - 1
  }

  const openingFront = Boolean(turn && displayPage <= 1 && turn.direction === 'forward')
  const closingFront = Boolean(turn && displayPage <= 2 && turn.direction === 'backward')
  const closingBack = Boolean(turn && turn.direction === 'forward' && nextTarget(displayPage) === totalPages)
  const openingBack = Boolean(turn && displayPage >= totalPages && turn.direction === 'backward')

  let sceneShift = 0
  let sceneScale = 1

  if (!turn && isFrontCover) {
    sceneShift = -pageWidth / 2
    sceneScale = coverScale
  } else if (!turn && isBackCover) {
    sceneShift = pageWidth / 2
    sceneScale = coverScale
  } else if (openingFront) {
    sceneShift = -(pageWidth / 2) * (1 - progress)
    sceneScale = coverScale - (coverScale - 1) * progress
  } else if (closingFront) {
    sceneShift = -(pageWidth / 2) * progress
    sceneScale = 1 + (coverScale - 1) * progress
  } else if (closingBack) {
    sceneShift = (pageWidth / 2) * progress
    sceneScale = 1 + (coverScale - 1) * progress
  } else if (openingBack) {
    sceneShift = (pageWidth / 2) * (1 - progress)
    sceneScale = coverScale - (coverScale - 1) * progress
  }

  const turnAngle = turn
    ? (turn.direction === 'forward' ? -180 : 180) * progress
    : 0

  const turnRadius = `${Math.round(3 + progress * 11)}px`
  const turnEdgeOpacity = String(0.18 + progress * 0.58)
  const turnShadowOpacity = String(0.06 + progress * 0.20)

  return (
    <div
      className={`impact-mobile-custom-book${isFrontCover ? ' is-front-cover' : ''}${isBackCover ? ' is-back-cover' : ''}${turn ? ' is-turning' : ''}`}
      aria-label="Impact Report mobile book viewer"
      style={{
        '--impact-mobile-page-width': `${pageWidth}px`,
        '--impact-mobile-page-height': `${pageHeight}px`,
        '--impact-mobile-stage-height': `${stageHeight}px`,
        '--impact-turn-progress': progress,
        '--impact-turn-radius': turnRadius,
        '--impact-turn-edge-opacity': turnEdgeOpacity,
        '--impact-turn-shadow-opacity': turnShadowOpacity,
      }}
    >
      <div
        className="impact-mobile-custom-book__gesture"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerGesture}
        onPointerCancel={finishPointerGesture}
      >
        <div
          className="impact-mobile-custom-book__scene"
          style={{ transform: `translate3d(${sceneShift}px, 0, 0) scale(${sceneScale})` }}
        >
          <div className="impact-mobile-custom-book__slot impact-mobile-custom-book__slot--left">
            {leftPage && (
              <div className="impact-mobile-custom-book__page">
                <ReportImage page={leftPage} totalPages={totalPages} priority={leftPage <= 4} />
              </div>
            )}
          </div>

          <div className="impact-mobile-custom-book__slot impact-mobile-custom-book__slot--right">
            {rightPage && (
              <div className="impact-mobile-custom-book__page">
                <ReportImage page={rightPage} totalPages={totalPages} priority={rightPage <= 4} />
              </div>
            )}
          </div>

          {turn && flipFront && flipBack && (
            <div
              className={`impact-mobile-custom-book__turn-sheet impact-mobile-custom-book__turn-sheet--${turn.direction}`}
              style={{ transform: `rotateY(${turnAngle}deg)` }}
            >
              <div className="impact-mobile-custom-book__face impact-mobile-custom-book__face--front">
                <ReportImage page={flipFront} totalPages={totalPages} priority />
              </div>
              <div className="impact-mobile-custom-book__face impact-mobile-custom-book__face--back">
                <ReportImage page={flipBack} totalPages={totalPages} priority />
              </div>
            </div>
          )}

          <div className="impact-mobile-custom-book__spine" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
})

export default MobileImpactSlider
