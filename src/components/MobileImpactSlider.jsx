import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
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
  const hostRef = useRef(null)
  const pageRef = useRef(clamp(Number(currentPage) || 1, 1, totalPages))
  const gestureRef = useRef(null)
  const animationRef = useRef(null)

  const [page, setPage] = useState(pageRef.current)
  const [turn, setTurn] = useState(null)
  const [viewerWidth, setViewerWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : Math.min(window.innerWidth, 520)
  ))

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined

    const update = () => {
      const width = host.getBoundingClientRect().width
      if (width > 0) setViewerWidth(width)
    }

    update()

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(update)
      : null

    observer?.observe(host)
    window.addEventListener('resize', update, { passive: true })

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  useEffect(() => {
    if (turn || animationRef.current) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    pageRef.current = next
    setPage(next)
  }, [currentPage, totalPages, turn])

  useEffect(() => {
    const preload = (pageNumber) => {
      if (pageNumber < 1 || pageNumber > totalPages) return
      const image = new Image()
      image.src = `${import.meta.env.BASE_URL}assets/impact-report/page-${String(pageNumber).padStart(2, '0')}.webp`
    }

    ;[page - 2, page - 1, page, page + 1, page + 2].forEach(preload)
  }, [page, totalPages])

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }, [])

  const pageWidth = useMemo(() => {
    // SEDCO keeps one portrait page inside a fixed grey frame on phone.
    // About 80% of the viewer width leaves the same narrow side gutters.
    return Math.round(clamp(viewerWidth * 0.80, 220, 340))
  }, [viewerWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  const getTarget = (direction, source = pageRef.current) => {
    if (direction === 'forward') {
      return source < totalPages ? source + 1 : null
    }
    return source > 1 ? source - 1 : null
  }

  const commitTurn = (direction) => {
    const target = getTarget(direction)
    if (!target) {
      setTurn(null)
      return
    }

    pageRef.current = target
    setPage(target)
    setTurn(null)
    onPageChange?.(target)
  }

  const animateProgress = (direction, fromProgress, toProgress, commitAtEnd) => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)

    const startedAt = performance.now()
    const distance = Math.abs(toProgress - fromProgress)
    const duration = Math.max(160, 520 * distance)

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

  const startTurn = (direction) => {
    if (turn || animationRef.current || !getTarget(direction)) return
    onPageTurn?.()
    setTurn({ direction, progress: 0, interactive: false })
    animateProgress(direction, 0, 1, true)
  }

  useImperativeHandle(ref, () => ({
    goTo(pageNumber) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      animationRef.current = null
      setTurn(null)

      const target = clamp(Number(pageNumber) || 1, 1, totalPages)
      pageRef.current = target
      setPage(target)
      onPageChange?.(target)
    },
    next() {
      startTurn('forward')
    },
    previous() {
      startTurn('backward')
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
    const elapsed = Math.max(1, now - gesture.lastTime)
    gesture.velocity = (event.clientX - gesture.lastX) / elapsed
    gesture.lastX = event.clientX
    gesture.lastTime = now

    if (!gesture.direction && Math.abs(dx) > 7) {
      const direction = dx < 0 ? 'forward' : 'backward'
      if (!getTarget(direction)) return
      gesture.direction = direction
      onPageTurn?.()
    }

    if (!gesture.direction) return

    const travel = gesture.direction === 'forward' ? -dx : dx
    const progress = clamp(travel / (pageWidth * 0.78), 0, 1)
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

    const directionalVelocity = gesture.direction === 'forward'
      ? -gesture.velocity
      : gesture.velocity

    const shouldComplete = gesture.progress > 0.20 || directionalVelocity > 0.32

    animateProgress(
      gesture.direction,
      gesture.progress,
      shouldComplete ? 1 : 0,
      shouldComplete,
    )
  }

  const progress = turn?.progress ?? 0
  const direction = turn?.direction ?? null
  const targetPage = direction ? getTarget(direction, page) : null

  // SEDCO shows only one portrait page after each turn. During a forward turn,
  // the current sheet swings left and exposes the next page underneath. During
  // a backward turn, the previous sheet swings in from the left over the current page.
  const basePage = direction === 'forward'
    ? targetPage
    : page

  const turningPage = direction === 'forward'
    ? page
    : targetPage

  const backFacePage = direction === 'forward'
    ? targetPage
    : page

  const turnAngle = direction === 'forward'
    ? -180 * progress
    : -180 + (180 * progress)

  const curl = Math.sin(Math.PI * progress)
  const turnScaleX = 1 - (0.055 * curl)

  return (
    <div
      ref={hostRef}
      className={`impact-mobile-sedco-single${turn ? ' is-turning' : ''}`}
      aria-label="Impact Report mobile book viewer"
      style={{
        '--impact-mobile-page-width': `${pageWidth}px`,
        '--impact-mobile-page-height': `${pageHeight}px`,
        '--impact-turn-progress': progress,
        '--impact-turn-curl': curl,
      }}
    >
      <div
        className="impact-mobile-sedco-single__gesture"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerGesture}
        onPointerCancel={finishPointerGesture}
      >
        <div className="impact-mobile-sedco-single__book">
          <div className="impact-mobile-sedco-single__paper impact-mobile-sedco-single__paper--base">
            <ReportImage
              page={basePage || page}
              totalPages={totalPages}
              priority
            />
          </div>

          {turn && turningPage && backFacePage && (
            <div
              className={`impact-mobile-sedco-single__turn impact-mobile-sedco-single__turn--${direction}`}
              style={{ transform: `rotateY(${turnAngle}deg) scaleX(${turnScaleX})` }}
            >
              <div className="impact-mobile-sedco-single__face impact-mobile-sedco-single__face--front">
                <ReportImage page={turningPage} totalPages={totalPages} priority />
              </div>
              <div className="impact-mobile-sedco-single__face impact-mobile-sedco-single__face--back">
                <ReportImage page={backFacePage} totalPages={totalPages} priority />
              </div>
            </div>
          )}

          <div className="impact-mobile-sedco-single__page-stack" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
})

export default MobileImpactSlider
