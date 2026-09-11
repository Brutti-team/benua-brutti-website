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
  const [targetPage, setTargetPage] = useState(null)
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
    if (isDragging || isSettling || targetPage !== null) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    activePageRef.current = next
    setActivePage(next)
  }, [currentPage, totalPages, isDragging, isSettling, targetPage])

  useEffect(() => {
    ;[activePage - 2, activePage - 1, activePage, activePage + 1, activePage + 2].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [activePage, totalPages])

  const pageWidth = useMemo(() => {
    return Math.round(Math.max(230, Math.min(314, viewportWidth * 0.735)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  // This parity is the important SEDCO behaviour from the supplied video:
  // page 1 opens to the LEFT, page 2 opens to the RIGHT, page 3 to the LEFT, etc.
  const turnSide = activePage % 2 === 1 ? 'left' : 'right'
  const canGoNext = activePage < totalPages
  const canGoPrevious = activePage > 1

  const resetTurn = () => {
    setTargetPage(null)
    setTurnProgress(0)
    setIsDragging(false)
    setIsSettling(false)
  }

  const commitTarget = () => {
    if (targetPage === null) {
      resetTurn()
      return
    }

    const target = clamp(targetPage, 1, totalPages)
    activePageRef.current = target
    setActivePage(target)
    setTargetPage(null)
    setTurnProgress(0)
    setIsDragging(false)
    setIsSettling(false)
    onPageChange?.(target)
  }

  const settleTo = (destination, { playSound = false } = {}) => {
    if (targetPage === null) return

    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)

    if (playSound) onPageTurn?.()

    setIsDragging(false)
    setIsSettling(true)

    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurnProgress(destination)
      })
    })

    const duration = destination === 1 ? 430 : 300
    settleTimerRef.current = window.setTimeout(() => {
      if (destination === 1) commitTarget()
      else resetTurn()
    }, duration + 35)
  }

  const beginProgrammaticTurn = (direction) => {
    if (isDragging || isSettling || targetPage !== null) return
    const target = activePageRef.current + direction
    if (target < 1 || target > totalPages) return

    setTargetPage(target)
    setTurnProgress(0)
    setIsSettling(true)
    onPageTurn?.()

    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurnProgress(1)
      })
    })

    settleTimerRef.current = window.setTimeout(() => {
      activePageRef.current = target
      setActivePage(target)
      setTargetPage(null)
      setTurnProgress(0)
      setIsSettling(false)
      onPageChange?.(target)
    }, 465)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
      if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)
      activePageRef.current = target
      setActivePage(target)
      resetTurn()
      onPageChange?.(target)
    },
    next() {
      beginProgrammaticTurn(1)
    },
    previous() {
      beginProgrammaticTurn(-1)
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
    const target = activePageRef.current + direction
    const allowed = target >= 1 && target <= totalPages
    gesture.direction = direction

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    if (!allowed) {
      setIsDragging(true)
      setTargetPage(null)
      setTurnProgress(0)
      return
    }

    if (targetPage !== target) setTargetPage(target)

    // Finger distance controls only HOW FAR the page has opened. The physical
    // direction of the sheet follows page parity, exactly like the SEDCO flow:
    // 1 -> left, 2 -> right, 3 -> left ...
    const progress = clamp(Math.abs(dx) / (pageWidth * 0.72), 0, 1)

    if (!gesture.soundPlayed && progress > 0.045) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    setTurnProgress(progress)
    setIsDragging(true)
  }

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal' || gesture.direction === 0 || targetPage === null) {
      resetTurn()
      return
    }

    const directionalVelocity = gesture.direction === 1 ? -gesture.velocityX : gesture.velocityX
    const shouldComplete = turnProgress > 0.17 || directionalVelocity > 0.30
    settleTo(shouldComplete ? 1 : 0)
  }

  const foldStrength = Math.sin(Math.PI * Math.min(turnProgress, 0.999))
  const angle = turnProgress * 91
  const signedAngle = turnSide === 'left' ? -angle : angle
  const edgeLift = 1 + foldStrength * 7
  const slightTilt = turnSide === 'left' ? -0.22 * foldStrength : 0.22 * foldStrength
  const turningShadow = 0.10 + foldStrength * 0.24
  const pageBehind = targetPage ?? activePage

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
      <div className={`impact-sedco-mobile-book is-page-${activePage % 2 === 1 ? 'odd' : 'even'} is-turning-${turnSide}`}>
        <div className="impact-sedco-mobile-stack impact-sedco-mobile-stack--left" aria-hidden="true" />
        <div className="impact-sedco-mobile-stack impact-sedco-mobile-stack--right" aria-hidden="true" />
        <div className="impact-sedco-mobile-spine" aria-hidden="true" />

        <MobilePage
          page={pageBehind}
          className="impact-sedco-mobile-page--base"
        />

        {targetPage !== null && (
          <MobilePage
            page={activePage}
            className={`impact-sedco-mobile-page--turning is-turning-${turnSide}`}
            turning
            style={{
              '--page-fold': foldStrength,
              '--page-progress': turnProgress,
              transform: `rotateY(${signedAngle}deg) rotateZ(${slightTilt}deg) translateZ(${edgeLift}px)`,
              boxShadow: `${turnSide === 'left' ? 9 : -9}px 5px 25px rgba(0,0,0,${turningShadow})`,
            }}
          />
        )}
      </div>
    </div>
  )
})

export default MobileImpactSlider
