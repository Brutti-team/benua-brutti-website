import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function MobilePage({ page, className = '', style, turning = false }) {
  if (!page) return null

  return (
    <div className={`impact-sedco-mobile-page ${className}`} style={style}>
      <img
        src={pageImage(page)}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading="eager"
        fetchPriority={page <= 2 ? 'high' : 'auto'}
      />
      {turning && <span className="impact-sedco-mobile-fold-shade" aria-hidden="true" />}
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const gestureRef = useRef(null)
  const settleTimerRef = useRef(null)
  const settleFrameRef = useRef(null)
  const activePageRef = useRef(clamp(Number(currentPage) || 1, 1, totalPages))

  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [activePage, setActivePage] = useState(activePageRef.current)
  const [turnDirection, setTurnDirection] = useState(0)
  const [turnProgress, setTurnProgress] = useState(0)
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
  }, [])

  useEffect(() => {
    if (isDragging || isSettling || turnDirection !== 0) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    activePageRef.current = next
    setActivePage(next)
  }, [currentPage, totalPages, isDragging, isSettling, turnDirection])

  useEffect(() => {
    ;[activePage - 2, activePage - 1, activePage, activePage + 1, activePage + 2].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [activePage, totalPages])

  const pageWidth = useMemo(() => {
    // Same phone proportion as the SEDCO directory shown in the reference video.
    return Math.round(Math.max(228, Math.min(310, viewportWidth * 0.72)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const canGoNext = activePage < totalPages
  const canGoPrevious = activePage > 1

  const clearTurn = () => {
    setTurnDirection(0)
    setTurnProgress(0)
    setIsDragging(false)
    setIsSettling(false)
  }

  const commitPage = (direction) => {
    const target = clamp(activePageRef.current + direction, 1, totalPages)
    activePageRef.current = target
    setActivePage(target)
    clearTurn()
    onPageChange?.(target)
  }

  const settleTurn = (direction, destination, playSound = false) => {
    const allowed = direction === 1 ? canGoNext : canGoPrevious
    if (!allowed) {
      clearTurn()
      return
    }

    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)

    if (playSound) onPageTurn?.()

    setTurnDirection(direction)
    setIsDragging(false)
    setIsSettling(true)

    // Let the browser paint the current fold angle first, then animate to the edge.
    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurnProgress(destination)
      })
    })

    const duration = destination === 1 ? 370 : 300
    settleTimerRef.current = window.setTimeout(() => {
      if (destination === 1) commitPage(direction)
      else clearTurn()
    }, duration + 35)
  }

  const startProgrammaticTurn = (direction) => {
    const allowed = direction === 1 ? canGoNext : canGoPrevious
    if (!allowed || isDragging || isSettling) return

    setTurnDirection(direction)
    setTurnProgress(0)
    settleTurn(direction, 1, true)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
      activePageRef.current = target
      setActivePage(target)
      clearTurn()
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

    if (gesture.locked === null && (Math.abs(dx) > 7 || Math.abs(dy) > 7)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.08 ? 'horizontal' : 'vertical'
    }

    if (gesture.locked !== 'horizontal') return

    const direction = dx < 0 ? 1 : -1
    const allowed = direction === 1 ? canGoNext : canGoPrevious
    gesture.direction = direction

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    if (!allowed) {
      setTurnDirection(0)
      setTurnProgress(0)
      setIsDragging(true)
      return
    }

    // In the SEDCO viewer the page does not slide sideways. Its LEFT edge stays
    // fixed while the sheet rotates toward the viewer's left like a hinged page.
    const progress = clamp(Math.abs(dx) / (pageWidth * 0.78), 0, 1)

    if (!gesture.soundPlayed && progress > 0.045) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    setTurnDirection(direction)
    setTurnProgress(progress)
    setIsDragging(true)
  }

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal' || gesture.direction === 0) {
      clearTurn()
      return
    }

    const direction = gesture.direction
    const allowed = direction === 1 ? canGoNext : canGoPrevious
    const directionalVelocity = direction === 1 ? -gesture.velocityX : gesture.velocityX
    const shouldComplete = allowed && (turnProgress > 0.16 || directionalVelocity > 0.28)

    settleTurn(direction, shouldComplete ? 1 : 0, false)
  }

  const nextPage = activePage < totalPages ? activePage + 1 : null
  const previousPage = activePage > 1 ? activePage - 1 : null

  const basePage = turnDirection === 1 ? (nextPage || activePage) : activePage
  const turningPage = turnDirection === 1
    ? activePage
    : turnDirection === -1
      ? previousPage
      : null

  // The SEDCO clip turns the sheet only until it is nearly edge-on, then swaps
  // pages. It does not show a full 180-degree backside rotation.
  const maxAngle = 88
  const turnAngle = turnDirection === 1
    ? -(maxAngle * turnProgress)
    : turnDirection === -1
      ? -(maxAngle * (1 - turnProgress))
      : 0

  const foldStrength = Math.sin(Math.PI * turnProgress)
  const turningShadow = 0.12 + foldStrength * 0.22

  return (
    <div
      className={`impact-sedco-mobile-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}`}
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
      }}
      aria-label={`Impact Report page ${activePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      <div className="impact-sedco-mobile-book">
        <div className="impact-sedco-mobile-stack" aria-hidden="true" />

        <MobilePage
          page={basePage}
          className="impact-sedco-mobile-page--base"
        />

        {turningPage && (
          <MobilePage
            page={turningPage}
            className={`impact-sedco-mobile-page--turning${turnDirection === -1 ? ' is-previous' : ''}`}
            turning
            style={{
              '--page-fold': foldStrength,
              transform: `rotateY(${turnAngle}deg) translateZ(1px)`,
              boxShadow: `8px 4px 24px rgba(0,0,0,${turningShadow})`,
            }}
          />
        )}
      </div>
    </div>
  )
})

export default MobileImpactSlider
