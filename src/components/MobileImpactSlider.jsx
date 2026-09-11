import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function PageFace({ page, className = '' }) {
  if (!page) return null

  return (
    <div className={`impact-sedco-page-face ${className}`}>
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
  const turnRef = useRef(null)
  const gestureRef = useRef(null)
  const progressRef = useRef(0)
  const animationRef = useRef(null)
  const leafRef = useRef(null)
  const bookRef = useRef(null)
  const pendingAutoRef = useRef(false)

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
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
  }, [])

  useEffect(() => {
    if (turnRef.current || isDragging || isSettling) return
    const next = clamp(Number(currentPage) || 1, 1, totalPages)
    activePageRef.current = next
    setActivePage(next)
  }, [currentPage, totalPages, isDragging, isSettling])

  useEffect(() => {
    ;[activePage - 2, activePage - 1, activePage, activePage + 1, activePage + 2].forEach((page) => {
      if (page < 1 || page > totalPages) return
      const image = new Image()
      image.src = pageImage(page)
    })
  }, [activePage, totalPages])

  const pageWidth = useMemo(() => (
    Math.round(Math.max(230, Math.min(308, viewportWidth * 0.72)))
  ), [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  const clearAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
  }

  const makeTurn = (direction) => {
    const from = activePageRef.current
    const target = from + direction
    if (target < 1 || target > totalPages) return null
    return { direction, from, target }
  }

  const applyProgress = (rawProgress) => {
    const state = turnRef.current
    const leaf = leafRef.current
    const book = bookRef.current
    if (!state || !leaf || !book) return

    const progress = clamp(rawProgress, 0, 1)
    progressRef.current = progress

    // The SEDCO phone viewer keeps the book at a fixed size. The current sheet
    // simply folds into the left spine, exposing the next full page underneath.
    // There is no zoom-out / two-page spread during the turn.
    const maxAngle = 88.8
    const angle = state.direction === 1
      ? -(maxAngle * progress)
      : -(maxAngle * (1 - progress))

    leaf.style.transition = 'none'
    leaf.style.transform = `rotateY(${angle}deg) translateZ(1px)`

    const fold = Math.sin(Math.PI * Math.min(progress, 0.999))
    const edge = Math.sin((Math.PI / 2) * progress)
    book.style.setProperty('--sedco-fold', String(fold))
    book.style.setProperty('--sedco-edge', String(edge))
    book.style.setProperty('--sedco-progress', String(progress))
  }

  const animateProgress = (destination, duration, onDone) => {
    clearAnimation()

    const from = progressRef.current
    const start = performance.now()
    const distance = Math.abs(destination - from)
    if (distance < 0.002) {
      applyProgress(destination)
      onDone?.()
      return
    }

    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1)

      // SEDCO's release is quick at first and soft at the end. This curve avoids
      // the robotic constant-speed look while keeping the page attached to the finger.
      const eased = 1 - Math.pow(1 - t, 3.35)
      const value = from + ((destination - from) * eased)
      applyProgress(value)

      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick)
      } else {
        animationRef.current = null
        onDone?.()
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  const resetTurnVisuals = () => {
    progressRef.current = 0
    bookRef.current?.style.setProperty('--sedco-fold', '0')
    bookRef.current?.style.setProperty('--sedco-edge', '0')
    bookRef.current?.style.setProperty('--sedco-progress', '0')
  }

  const commitTurn = () => {
    const state = turnRef.current
    if (!state) return

    const target = clamp(state.target, 1, totalPages)
    activePageRef.current = target
    turnRef.current = null
    resetTurnVisuals()
    setActivePage(target)
    setTurn(null)
    setIsDragging(false)
    setIsSettling(false)
    onPageChange?.(target)
  }

  const cancelTurn = () => {
    const state = turnRef.current
    if (!state) return

    setIsDragging(false)
    setIsSettling(true)

    const distance = progressRef.current
    const duration = clamp(115 + (distance * 190), 120, 285)

    animateProgress(0, duration, () => {
      turnRef.current = null
      resetTurnVisuals()
      setTurn(null)
      setIsSettling(false)
    })
  }

  const completeTurn = () => {
    const state = turnRef.current
    if (!state) return

    setIsDragging(false)
    setIsSettling(true)

    const remaining = 1 - progressRef.current
    // A complete SEDCO turn is roughly 0.35–0.40s from a standing page. If the
    // finger already moved the sheet, only animate the remaining distance.
    const duration = clamp(105 + (remaining * 255), 110, 360)

    animateProgress(1, duration, commitTurn)
  }

  const beginTurn = (direction, auto = false) => {
    if (turnRef.current || isSettling) return false

    const next = makeTurn(direction)
    if (!next) return false

    clearAnimation()
    turnRef.current = next
    progressRef.current = 0
    pendingAutoRef.current = auto
    setTurn(next)
    return true
  }

  useLayoutEffect(() => {
    if (!turn) return

    applyProgress(progressRef.current)

    if (pendingAutoRef.current) {
      pendingAutoRef.current = false
      onPageTurn?.()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => completeTurn())
      })
    }
  }, [turn, pageWidth])

  useImperativeHandle(ref, () => ({
    goTo(page) {
      clearAnimation()
      const target = clamp(Number(page) || 1, 1, totalPages)
      activePageRef.current = target
      turnRef.current = null
      resetTurnVisuals()
      setActivePage(target)
      setTurn(null)
      setIsDragging(false)
      setIsSettling(false)
      onPageChange?.(target)
    },
    next() {
      beginTurn(1, true)
    },
    previous() {
      beginTurn(-1, true)
    },
  }))

  const handlePointerDown = (event) => {
    if (isSettling || turnRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastTime: performance.now(),
      velocityX: 0,
      direction: 0,
      locked: null,
      soundPlayed: false,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || isSettling) return

    const samples = event.getCoalescedEvents?.() || [event]
    const sample = samples[samples.length - 1] || event
    const dx = sample.clientX - gesture.startX
    const dy = sample.clientY - gesture.startY

    if (gesture.locked === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.04 ? 'horizontal' : 'vertical'

      if (gesture.locked === 'horizontal') {
        gesture.direction = dx < 0 ? 1 : -1
        if (!beginTurn(gesture.direction, false)) {
          gesture.locked = 'blocked'
          return
        }
        setIsDragging(true)
      }
    }

    if (gesture.locked !== 'horizontal') return

    const now = performance.now()
    const dt = Math.max(1, now - gesture.lastTime)
    gesture.velocityX = (sample.clientX - gesture.lastX) / dt
    gesture.lastX = sample.clientX
    gesture.lastTime = now

    const distance = gesture.direction === 1
      ? Math.max(0, -dx)
      : Math.max(0, dx)

    // Slightly longer travel than before = less twitchy, more controlled SEDCO feel.
    const progress = clamp(distance / (pageWidth * 0.88), 0, 1)

    if (!gesture.soundPlayed && progress > 0.055) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

    // Direct DOM update: no React render on every finger movement.
    applyProgress(progress)
  }

  const finishGesture = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal' || !turnRef.current) {
      setIsDragging(false)
      return
    }

    const directionalVelocity = gesture.direction === 1
      ? -gesture.velocityX
      : gesture.velocityX

    const shouldComplete = progressRef.current > 0.18 || directionalVelocity > 0.24
    if (shouldComplete) completeTurn()
    else cancelTurn()
  }

  const basePage = turn
    ? (turn.direction === 1 ? turn.target : activePage)
    : activePage

  const leafPage = turn
    ? (turn.direction === 1 ? activePage : turn.target)
    : null

  return (
    <div
      className={`impact-sedco-mobile-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}${turn ? ` is-turn-${turn.direction === 1 ? 'forward' : 'backward'}` : ''}`}
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
      <div ref={bookRef} className="impact-sedco-book-shell">
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--3" aria-hidden="true" />
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--2" aria-hidden="true" />
        <div className="impact-sedco-paper-stack impact-sedco-paper-stack--1" aria-hidden="true" />

        <div className="impact-sedco-static-page">
          <PageFace page={basePage} className="impact-sedco-static-page__face" />
        </div>

        {leafPage && (
          <div ref={leafRef} className="impact-sedco-turning-leaf">
            <PageFace page={leafPage} className="impact-sedco-turning-leaf__face" />
            <span className="impact-sedco-leaf-shadow" aria-hidden="true" />
            <span className="impact-sedco-leaf-edge" aria-hidden="true" />
          </div>
        )}

        <span className="impact-sedco-book-spine" aria-hidden="true" />
      </div>
    </div>
  )
})

export default MobileImpactSlider
