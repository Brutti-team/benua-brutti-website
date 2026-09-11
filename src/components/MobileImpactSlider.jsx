import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function mobilePageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const pointerRef = useRef(null)
  const timerRef = useRef(null)
  const rafRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [visiblePage, setVisiblePage] = useState(currentPage)
  const [underPage, setUnderPage] = useState(null)
  const [direction, setDirection] = useState(null)
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [settling, setSettling] = useState(false)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!dragging && !settling && currentPage !== visiblePage) {
      setVisiblePage(currentPage)
    }
  }, [currentPage, dragging, settling, visiblePage])

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
  }, [])

  useEffect(() => {
    ;[visiblePage - 1, visiblePage, visiblePage + 1].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = mobilePageImage(page)
    })
  }, [visiblePage, totalPages])

  const pageWidth = useMemo(() => {
    return Math.round(Math.max(232, Math.min(316, viewportWidth * 0.72)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const progress = Math.min(1, Math.abs(dragX) / pageWidth)

  const clearTurn = () => {
    setUnderPage(null)
    setDirection(null)
    setDragX(0)
    setDragging(false)
    setSettling(false)
  }

  const finishTurn = (target) => {
    setVisiblePage(target)
    onPageChange?.(target)
    clearTurn()
  }

  const getTarget = (turnDirection, explicitTarget) => {
    if (Number.isFinite(Number(explicitTarget))) {
      return clamp(Number(explicitTarget), 1, totalPages)
    }

    return clamp(
      visiblePage + (turnDirection === 'next' ? 1 : -1),
      1,
      totalPages,
    )
  }

  const animateTurn = (turnDirection, explicitTarget) => {
    if (settling || dragging) return

    const target = getTarget(turnDirection, explicitTarget)
    if (target === visiblePage) return

    if (timerRef.current) window.clearTimeout(timerRef.current)
    if (rafRef.current) window.cancelAnimationFrame(rafRef.current)

    setDirection(turnDirection)
    setUnderPage(target)
    setDragX(0)
    setSettling(true)
    onPageTurn?.()

    rafRef.current = window.requestAnimationFrame(() => {
      rafRef.current = window.requestAnimationFrame(() => {
        setDragX(turnDirection === 'next' ? -pageWidth * 1.04 : pageWidth * 1.04)
      })
    })

    timerRef.current = window.setTimeout(() => {
      finishTurn(target)
    }, 460)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page), 1, totalPages)
      if (!Number.isFinite(target) || target === visiblePage) return
      animateTurn(target > visiblePage ? 'next' : 'previous', target)
    },
    next() {
      animateTurn('next')
    },
    previous() {
      animateTurn('previous')
    },
  }))

  const handlePointerDown = (event) => {
    if (settling) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      lastX: event.clientX,
      active: false,
      cancelled: false,
    }
  }

  const handlePointerMove = (event) => {
    const pointer = pointerRef.current
    if (!pointer || pointer.id !== event.pointerId || pointer.cancelled || settling) return

    const deltaX = event.clientX - pointer.x
    const deltaY = event.clientY - pointer.y
    pointer.lastX = event.clientX

    if (!pointer.active) {
      if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return

      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.1) {
        pointer.cancelled = true
        return
      }

      pointer.active = true
      setDragging(true)
      event.currentTarget.setPointerCapture?.(event.pointerId)
    }

    const nextDirection = deltaX < 0 ? 'next' : 'previous'
    const target = getTarget(nextDirection)
    const atBoundary = target === visiblePage
    const resistance = atBoundary ? 0.16 : 1
    const boundedDrag = clamp(deltaX * resistance, -pageWidth * 0.96, pageWidth * 0.96)

    setDirection(nextDirection)
    setUnderPage(atBoundary ? null : target)
    setDragX(boundedDrag)
  }

  const handlePointerUp = (event) => {
    const pointer = pointerRef.current
    pointerRef.current = null
    if (!pointer || pointer.id !== event.pointerId) return

    if (!pointer.active || pointer.cancelled) {
      setDragging(false)
      return
    }

    const deltaX = pointer.lastX - pointer.x
    const turnDirection = deltaX < 0 ? 'next' : 'previous'
    const target = getTarget(turnDirection)
    const canTurn = target !== visiblePage
    const shouldTurn = canTurn && Math.abs(deltaX) >= Math.max(42, pageWidth * 0.18)

    setDragging(false)
    setSettling(true)

    if (timerRef.current) window.clearTimeout(timerRef.current)

    if (shouldTurn) {
      setUnderPage(target)
      setDirection(turnDirection)
      onPageTurn?.()
      setDragX(turnDirection === 'next' ? -pageWidth * 1.04 : pageWidth * 1.04)

      timerRef.current = window.setTimeout(() => {
        finishTurn(target)
      }, 430)
      return
    }

    setDragX(0)
    timerRef.current = window.setTimeout(() => {
      clearTurn()
    }, 280)
  }

  const handlePointerCancel = () => {
    pointerRef.current = null
    if (!dragging) return

    setDragging(false)
    setSettling(true)
    setDragX(0)

    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      clearTurn()
    }, 280)
  }

  const turnAngle = progress * 156
  const turnOffset = dragX * 0.09
  const topSheetTransform = direction === 'previous'
    ? `perspective(1500px) translate3d(${turnOffset}px, 0, 0) rotateY(${turnAngle}deg)`
    : direction === 'next'
      ? `perspective(1500px) translate3d(${turnOffset}px, 0, 0) rotateY(${-turnAngle}deg)`
      : 'perspective(1500px) translate3d(0, 0, 0) rotateY(0deg)'

  const underScale = 0.982 + progress * 0.018
  const underShift = direction === 'next' ? 5 - progress * 5 : -5 + progress * 5

  return (
    <div
      className={`impact-sedco-mobile-viewer${dragging ? ' is-dragging' : ''}${settling ? ' is-settling' : ''}`}
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
        '--page-turn-progress': progress,
      }}
      aria-label={`Impact Report page ${visiblePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="impact-sedco-mobile-book">
        <div className="impact-sedco-mobile-page-stack" aria-hidden="true" />

        {underPage && (
          <div
            className="impact-sedco-mobile-sheet impact-sedco-mobile-sheet--under"
            style={{ transform: `translate3d(${underShift}px, 0, 0) scale(${underScale})` }}
            aria-hidden="true"
          >
            <img src={mobilePageImage(underPage)} alt="" draggable="false" decoding="async" />
          </div>
        )}

        <div
          className={`impact-sedco-mobile-sheet impact-sedco-mobile-sheet--top${settling ? ' is-settling' : ''}`}
          style={{
            transform: topSheetTransform,
            transformOrigin: direction === 'previous' ? 'right center' : 'left center',
          }}
        >
          <img
            src={mobilePageImage(visiblePage)}
            alt={visiblePage === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${visiblePage}`}
            draggable="false"
            decoding="async"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  )
})

export default MobileImpactSlider
