import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function PageSheet({ page, side, pageWidth, pageHeight }) {
  if (!page) return null

  return (
    <div className={`impact-sedco-sheet-image is-${side}`} style={{ width: pageWidth, height: pageHeight }}>
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
    return Math.round(Math.max(226, Math.min(300, viewportWidth * 0.70)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(clamp(pageWidth * 0.10, 22, 31)), [pageWidth])
  const bookWidth = pageWidth + peekWidth

  const restSpread = useMemo(() => {
    if (activePage === 1) return null

    if (activePage % 2 === 0) {
      return {
        leftPage: activePage,
        rightPage: activePage < totalPages ? activePage + 1 : null,
        leftWidth: pageWidth,
      }
    }

    return {
      leftPage: activePage > 1 ? activePage - 1 : null,
      rightPage: activePage,
      leftWidth: peekWidth,
    }
  }, [activePage, totalPages, pageWidth, peekWidth])

  const makeTurn = (direction) => {
    const from = activePageRef.current
    const target = from + direction
    if (target < 1 || target > totalPages) return null

    // Cover -> page 2: the cover collapses to the left while page 2 opens on the right.
    if (from === 1 && direction === 1) {
      return {
        mode: 'cover-forward',
        target,
        progress: 0,
        leftPage: 1,
        rightPage: 2,
        startLeft: pageWidth,
        endLeft: 0,
      }
    }

    // Page 2 -> cover: exact reverse of the opening movement.
    if (from === 2 && direction === -1) {
      return {
        mode: 'cover-back',
        target,
        progress: 0,
        leftPage: 1,
        rightPage: 2,
        startLeft: 0,
        endLeft: pageWidth,
      }
    }

    // Forward from an even page: current large page is LEFT, next page is a thin
    // strip on the RIGHT. The centre seam travels left until the next page is large.
    if (direction === 1 && from % 2 === 0) {
      return {
        mode: 'spread',
        target,
        progress: 0,
        leftPage: from,
        rightPage: from + 1,
        startLeft: pageWidth,
        endLeft: peekWidth,
      }
    }

    // Forward from an odd page: current large page is RIGHT. The next page grows
    // from the LEFT, exactly matching the alternating SEDCO book flow.
    if (direction === 1 && from % 2 === 1) {
      return {
        mode: 'spread',
        target,
        progress: 0,
        leftPage: from + 1,
        rightPage: from,
        startLeft: peekWidth,
        endLeft: pageWidth,
      }
    }

    // Backward from an odd page: current page is RIGHT and previous even page
    // grows back on the LEFT.
    if (direction === -1 && from % 2 === 1) {
      return {
        mode: 'spread',
        target,
        progress: 0,
        leftPage: from - 1,
        rightPage: from,
        startLeft: peekWidth,
        endLeft: pageWidth,
      }
    }

    // Backward from an even page: previous odd page grows on the RIGHT.
    return {
      mode: 'spread',
      target,
      progress: 0,
      leftPage: from,
      rightPage: from - 1,
      startLeft: pageWidth,
      endLeft: peekWidth,
    }
  }

  const clearTurn = () => {
    setTurn(null)
    setIsDragging(false)
    setIsSettling(false)
  }

  const commitTurn = (turnState) => {
    const target = clamp(turnState.target, 1, totalPages)
    activePageRef.current = target
    setActivePage(target)
    clearTurn()
    onPageChange?.(target)
  }

  const settle = (destination, playSound = false) => {
    const currentTurn = turn
    if (!currentTurn) return

    if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
    if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)

    if (playSound) onPageTurn?.()
    setIsDragging(false)
    setIsSettling(true)

    settleFrameRef.current = requestAnimationFrame(() => {
      settleFrameRef.current = requestAnimationFrame(() => {
        setTurn((value) => (value ? { ...value, progress: destination } : value))
      })
    })

    const duration = destination === 1 ? 430 : 300
    settleTimerRef.current = window.setTimeout(() => {
      if (destination === 1) commitTurn(currentTurn)
      else clearTurn()
    }, duration + 35)
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
        setTurn((value) => (value ? { ...value, progress: 1 } : value))
      })
    })

    settleTimerRef.current = window.setTimeout(() => {
      commitTurn(nextTurn)
    }, 465)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (settleTimerRef.current) window.clearTimeout(settleTimerRef.current)
      if (settleFrameRef.current) cancelAnimationFrame(settleFrameRef.current)
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
    gesture.direction = direction

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    let currentTurn = turn
    if (!currentTurn || currentTurn.target !== activePageRef.current + direction) {
      currentTurn = makeTurn(direction)
      if (!currentTurn) return
      setTurn(currentTurn)
    }

    const progress = clamp(Math.abs(dx) / (pageWidth * 0.66), 0, 1)

    if (!gesture.soundPlayed && progress > 0.045) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    setTurn({ ...currentTurn, progress })
    setIsDragging(true)
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
    const shouldComplete = turn.progress > 0.18 || directionalVelocity > 0.30
    settle(shouldComplete ? 1 : 0)
  }

  const renderedTurn = turn
  const progress = renderedTurn?.progress ?? 0
  const leftWidth = renderedTurn
    ? lerp(renderedTurn.startLeft, renderedTurn.endLeft, progress)
    : restSpread?.leftWidth ?? pageWidth
  const rightWidth = renderedTurn ? Math.max(0, bookWidth - leftWidth) : restSpread ? bookWidth - leftWidth : 0

  const leftPage = renderedTurn?.leftPage ?? restSpread?.leftPage ?? null
  const rightPage = renderedTurn?.rightPage ?? restSpread?.rightPage ?? null
  const isCover = activePage === 1 && !renderedTurn
  const seamOpacity = renderedTurn || restSpread ? 1 : 0

  return (
    <div
      className={`impact-sedco-mobile-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}${isCover ? ' is-closed' : ' is-open'}`}
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
        '--sedco-book-width': `${bookWidth}px`,
        '--sedco-peek-width': `${peekWidth}px`,
      }}
      aria-label={`Impact Report page ${activePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      {isCover ? (
        <div className="impact-sedco-closed-book">
          <div className="impact-sedco-closed-book__pages" aria-hidden="true" />
          <PageSheet page={1} side="cover" pageWidth={pageWidth} pageHeight={pageHeight} />
        </div>
      ) : (
        <div className="impact-sedco-mobile-book" style={{ width: bookWidth, height: pageHeight }}>
          <div className="impact-sedco-book-edge impact-sedco-book-edge--left" aria-hidden="true" />
          <div className="impact-sedco-book-edge impact-sedco-book-edge--right" aria-hidden="true" />

          <div
            className="impact-sedco-book-panel impact-sedco-book-panel--left"
            style={{ width: leftWidth, height: pageHeight }}
          >
            <PageSheet page={leftPage} side="left" pageWidth={pageWidth} pageHeight={pageHeight} />
            <span className="impact-sedco-inner-shadow impact-sedco-inner-shadow--left" aria-hidden="true" />
          </div>

          <div
            className="impact-sedco-book-panel impact-sedco-book-panel--right"
            style={{ width: rightWidth, height: pageHeight }}
          >
            <PageSheet page={rightPage} side="right" pageWidth={pageWidth} pageHeight={pageHeight} />
            <span className="impact-sedco-inner-shadow impact-sedco-inner-shadow--right" aria-hidden="true" />
          </div>

          <span
            className="impact-sedco-book-seam"
            style={{ left: leftWidth, opacity: seamOpacity }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
})

export default MobileImpactSlider
