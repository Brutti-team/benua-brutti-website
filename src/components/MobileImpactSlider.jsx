import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function BookPage({ page, className = '', style }) {
  if (!page) return null

  return (
    <div className={`impact-sedco-book-page ${className}`} style={style}>
      <img
        src={pageImage(page)}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading="eager"
        fetchPriority={page <= 2 ? 'high' : 'auto'}
      />
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const activePageRef = useRef(clamp(Number(currentPage) || 1, 1, totalPages))
  const gestureRef = useRef(null)
  const settleTimerRef = useRef(null)
  const settleFrameRef = useRef(null)
  const dragFrameRef = useRef(null)
  const queuedProgressRef = useRef(null)

  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [activePage, setActivePage] = useState(activePageRef.current)
  const [turn, setTurn] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSettling, setIsSettling] = useState(false)

  useEffect(() => {
    const syncWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', syncWidth, { passive: true })
    return () => window.removeEventListener('resize', syncWidth)
  }, [])

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)
    if (dragFrameRef.current) cancelAnimationFrame(dragFrameRef.current)
  }, [])

  useEffect(() => {
    if (turn || isDragging || isSettling) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    activePageRef.current = next
    setActivePage(next)
  }, [currentPage, totalPages, turn, isDragging, isSettling])

  useEffect(() => {
    ;[activePage - 2, activePage - 1, activePage, activePage + 1, activePage + 2].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [activePage, totalPages])

  const pageWidth = useMemo(() => {
    return Math.round(Math.max(226, Math.min(302, viewportWidth * 0.705)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  const makeTurn = (direction) => {
    const from = activePageRef.current
    const target = from + direction
    if (target < 1 || target > totalPages) return null

    return {
      direction,
      from,
      target,
      progress: 0,
    }
  }

  const clearTimers = () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)
    settleTimerRef.current = null
    settleFrameRef.current = null
  }

  const clearTurn = () => {
    clearTimers()
    setTurn(null)
    setIsDragging(false)
    setIsSettling(false)
  }

  const commitTurn = (turnState) => {
    const target = clamp(turnState.target, 1, totalPages)
    activePageRef.current = target
    setActivePage(target)
    setTurn(null)
    setIsDragging(false)
    setIsSettling(false)
    onPageChange?.(target)
  }

  const queueProgress = (value) => {
    queuedProgressRef.current = clamp(value, 0, 1)
    if (dragFrameRef.current) return

    dragFrameRef.current = requestAnimationFrame(() => {
      dragFrameRef.current = null
      const nextProgress = queuedProgressRef.current
      setTurn((state) => (state ? { ...state, progress: nextProgress } : state))
    })
  }

  const settleTurn = (turnState, destination, { playSound = false } = {}) => {
    if (!turnState) return
    clearTimers()
    if (playSound) onPageTurn?.()

    setIsDragging(false)
    setIsSettling(true)

    // Paint the exact finger position first; only then enable the weighted finish.
    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurn((state) => (state ? { ...state, progress: destination } : state))
      })
    })

    const duration = destination === 1 ? 520 : 360
    settleTimerRef.current = window.setTimeout(() => {
      if (destination === 1) commitTurn(turnState)
      else clearTurn()
    }, duration + 45)
  }

  const startProgrammaticTurn = (direction) => {
    if (turn || isDragging || isSettling) return
    const nextTurn = makeTurn(direction)
    if (!nextTurn) return

    setTurn(nextTurn)
    setIsSettling(true)
    onPageTurn?.()

    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurn((state) => (state ? { ...state, progress: 1 } : state))
      })
    })

    settleTimerRef.current = window.setTimeout(() => {
      commitTurn(nextTurn)
    }, 565)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      clearTimers()
      activePageRef.current = target
      setActivePage(target)
      setTurn(null)
      setIsDragging(false)
      setIsSettling(false)
      onPageChange?.(target)
    },
    next() {
      startProgrammaticTurn(1)
    },
    previous() {
      startProgrammaticTurn(-1)
    },
  }))

  const handlePointerDown = (event) => {
    if (isSettling) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      locked: null,
      direction: 0,
      soundPlayed: false,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || isSettling) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY

    if (gesture.locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.08 ? 'horizontal' : 'vertical'
    }

    if (gesture.locked !== 'horizontal') return

    const direction = dx < 0 ? 1 : -1
    gesture.direction = direction

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    let currentTurn = turn
    if (!currentTurn || currentTurn.direction !== direction) {
      currentTurn = makeTurn(direction)
      if (!currentTurn) return
      setTurn(currentTurn)
    }

    // SEDCO reacts early: a short finger travel already creates a visible fold.
    const progress = clamp(Math.abs(dx) / (pageWidth * 0.76), 0, 1)

    if (!gesture.soundPlayed && progress > 0.045) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    setIsDragging(true)
    queueProgress(progress)
  }

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal' || gesture.direction === 0 || !turn) {
      clearTurn()
      return
    }

    const directionalVelocity = gesture.direction === 1 ? -gesture.velocityX : gesture.velocityX
    const shouldComplete = turn.progress > 0.17 || directionalVelocity > 0.28
    settleTurn(turn, shouldComplete ? 1 : 0)
  }

  const progress = turn?.progress ?? 0
  const easedFold = Math.sin(Math.min(progress, 1) * Math.PI * 0.5)

  // NEXT: current sheet is on top and closes toward the LEFT spine.
  // PREVIOUS: previous sheet starts edge-on at the LEFT spine and opens RIGHT.
  const forwardAngle = -88.5 * easedFold
  const backwardAngle = -88.5 * (1 - easedFold)
  const turningAngle = turn?.direction === 1 ? forwardAngle : backwardAngle
  const foldOpacity = Math.sin(Math.PI * Math.min(progress, 0.999))
  const edgeShadow = 0.10 + foldOpacity * 0.24

  const backgroundPage = turn?.direction === 1 ? turn.target : activePage
  const foregroundPage = turn?.direction === 1 ? activePage : turn?.target
  const restingPage = !turn ? activePage : null

  return (
    <div
      className={`impact-sedco-mobile-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}${turn ? ` is-turn-${turn.direction === 1 ? 'forward' : 'backward'}` : ''}`}
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
        '--page-fold': foldOpacity,
        '--page-progress': progress,
      }}
      aria-label={`Impact Report page ${activePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      <div className="impact-sedco-book-shell">
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--3" aria-hidden="true" />
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--2" aria-hidden="true" />
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--1" aria-hidden="true" />
        <div className="impact-sedco-book-spine" aria-hidden="true" />

        {restingPage && (
          <BookPage page={restingPage} className="impact-sedco-book-page--rest" />
        )}

        {turn && (
          <>
            <BookPage page={backgroundPage} className="impact-sedco-book-page--base" />
            <BookPage
              page={foregroundPage}
              className="impact-sedco-book-page--turning"
              style={{
                transform: `rotateY(${turningAngle}deg) translateZ(1px)`,
                boxShadow: `10px 3px 26px rgba(0,0,0,${edgeShadow})`,
              }}
            />
            <span className="impact-sedco-fold-light" aria-hidden="true" />
          </>
        )}
      </div>
    </div>
  )
})

export default MobileImpactSlider
