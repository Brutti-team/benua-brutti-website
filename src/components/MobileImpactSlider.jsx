import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function mobilePageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const pointerRef = useRef(null)
  const animationTimerRef = useRef(null)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [visiblePage, setVisiblePage] = useState(currentPage)
  const [turnDirection, setTurnDirection] = useState(null)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    setVisiblePage(currentPage)
  }, [currentPage])

  useEffect(() => () => {
    if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current)
  }, [])

  useEffect(() => {
    ;[visiblePage - 1, visiblePage + 1].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = mobilePageImage(page)
    })
  }, [visiblePage, totalPages])

  const pageWidth = useMemo(() => {
    // Keep one complete portrait page visible between the two edge controls.
    return Math.round(Math.max(220, Math.min(296, viewportWidth * 0.70)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  const changePage = (page, direction) => {
    const target = Math.max(1, Math.min(totalPages, Number(page)))
    if (!Number.isFinite(target) || target === visiblePage) return

    if (animationTimerRef.current) window.clearTimeout(animationTimerRef.current)

    const resolvedDirection = direction || (target > visiblePage ? 'next' : 'previous')
    setTurnDirection(resolvedDirection)
    setVisiblePage(target)
    onPageChange?.(target)
    onPageTurn?.()

    animationTimerRef.current = window.setTimeout(() => {
      setTurnDirection(null)
    }, 360)
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = Math.max(1, Math.min(totalPages, Number(page)))
      changePage(target, target >= visiblePage ? 'next' : 'previous')
    },
    next() {
      changePage(visiblePage + 1, 'next')
    },
    previous() {
      changePage(visiblePage - 1, 'previous')
    },
  }))

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    pointerRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerUp = (event) => {
    const start = pointerRef.current
    pointerRef.current = null
    if (!start || start.id !== event.pointerId) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    const horizontalSwipe = Math.abs(deltaX) >= 34 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15

    if (!horizontalSwipe) return
    if (deltaX < 0) changePage(visiblePage + 1, 'next')
    else changePage(visiblePage - 1, 'previous')
  }

  const handlePointerCancel = () => {
    pointerRef.current = null
  }

  return (
    <div
      className="impact-sedco-mobile-viewer"
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
      }}
      aria-label={`Impact Report page ${visiblePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        key={visiblePage}
        className={`impact-sedco-mobile-sheet${turnDirection ? ` is-turning-${turnDirection}` : ''}`}
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
  )
})

export default MobileImpactSlider
