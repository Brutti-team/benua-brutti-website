import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function MobilePage({ page, className, style }) {
  if (!page) return null

  return (
    <div className={className} style={style} aria-hidden={className.includes('side')}>
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
  const gestureRef = useRef(null)
  const settleTimerRef = useRef(null)
  const activePageRef = useRef(clamp(Number(currentPage) || 1, 1, totalPages))

  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [activePage, setActivePage] = useState(activePageRef.current)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isSettling, setIsSettling] = useState(false)
  const [settleDirection, setSettleDirection] = useState(0)

  useEffect(() => {
    const syncWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', syncWidth, { passive: true })
    return () => window.removeEventListener('resize', syncWidth)
  }, [])

  useEffect(() => () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
  }, [])

  useEffect(() => {
    if (isDragging || isSettling) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    activePageRef.current = next
    setActivePage(next)
  }, [currentPage, totalPages, isDragging, isSettling])

  useEffect(() => {
    ;[activePage - 2, activePage - 1, activePage + 1, activePage + 2].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [activePage, totalPages])

  const pageWidth = useMemo(() => {
    return Math.round(Math.max(228, Math.min(310, viewportWidth * 0.72)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const travel = pageWidth + 28
  const rawProgress = clamp(Math.abs(dragX) / travel, 0, 1)
  const dragDirection = dragX < 0 ? 1 : dragX > 0 ? -1 : 0
  const visibleDirection = isSettling ? settleDirection : dragDirection

  const canGoNext = activePage < totalPages
  const canGoPrevious = activePage > 1

  const commitPage = (direction) => {
    const target = clamp(activePageRef.current + direction, 1, totalPages)
    activePageRef.current = target
    setActivePage(target)
    setDragX(0)
    setIsDragging(false)
    setIsSettling(false)
    setSettleDirection(0)
    onPageChange?.(target)
  }

  const animateTo = (direction) => {
    if ((direction === 1 && !canGoNext) || (direction === -1 && !canGoPrevious)) return

    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    onPageTurn?.()
    setIsDragging(false)
    setIsSettling(true)
    setSettleDirection(direction)
    setDragX(direction === 1 ? -travel : travel)

    settleTimerRef.current = window.setTimeout(() => {
      commitPage(direction)
    }, 390)
  }

  const cancelDrag = () => {
    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    setIsDragging(false)
    setIsSettling(true)
    setSettleDirection(0)
    setDragX(0)

    settleTimerRef.current = window.setTimeout(() => {
      setIsSettling(false)
    }, 300)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (target === activePageRef.current) return
      activePageRef.current = target
      setActivePage(target)
      setDragX(0)
      setIsDragging(false)
      setIsSettling(false)
      setSettleDirection(0)
      onPageChange?.(target)
    },
    next() {
      animateTo(1)
    },
    previous() {
      animateTo(-1)
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
    const resistance = allowed ? 1 : 0.18
    const nextX = dx * resistance

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    if (!gesture.soundPlayed && Math.abs(nextX) > 16) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    setIsDragging(true)
    setDragX(nextX)
  }

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal') {
      setIsDragging(false)
      return
    }

    const direction = dragX < 0 ? 1 : -1
    const allowed = direction === 1 ? canGoNext : canGoPrevious
    const directionalVelocity = direction === 1 ? -gesture.velocityX : gesture.velocityX
    const shouldChange = allowed && (Math.abs(dragX) > pageWidth * 0.19 || directionalVelocity > 0.32)

    if (shouldChange) animateTo(direction)
    else cancelDrag()
  }

  const currentScale = 1 - rawProgress * 0.055
  const currentRotate = clamp(dragX / pageWidth, -1, 1) * -1.8
  const currentOpacity = 1 - rawProgress * 0.16
  const shadowStrength = 0.18 + rawProgress * 0.12

  const nextPage = activePage < totalPages ? activePage + 1 : null
  const previousPage = activePage > 1 ? activePage - 1 : null

  const incomingPage = visibleDirection === 1 ? nextPage : visibleDirection === -1 ? previousPage : null
  const incomingBaseX = visibleDirection === 1 ? travel : visibleDirection === -1 ? -travel : 0
  const incomingX = incomingPage ? incomingBaseX + dragX * 0.88 : 0
  const incomingProgress = incomingPage ? rawProgress : 0
  const incomingScale = 0.90 + incomingProgress * 0.10
  const incomingOpacity = 0.45 + incomingProgress * 0.55

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

        {incomingPage && (
          <MobilePage
            page={incomingPage}
            className="impact-sedco-mobile-page impact-sedco-mobile-page--side"
            style={{
              transform: `translate3d(${incomingX}px, 0, -20px) scale(${incomingScale})`,
              opacity: incomingOpacity,
            }}
          />
        )}

        <MobilePage
          page={activePage}
          className="impact-sedco-mobile-page impact-sedco-mobile-page--active"
          style={{
            transform: `translate3d(${dragX}px, 0, 0) rotateZ(${currentRotate}deg) scale(${currentScale})`,
            opacity: currentOpacity,
            boxShadow: `0 18px 34px rgba(0,0,0,${shadowStrength})`,
          }}
        />
      </div>
    </div>
  )
})

export default MobileImpactSlider
