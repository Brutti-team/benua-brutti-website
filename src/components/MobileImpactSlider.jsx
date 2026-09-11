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

function easeOutCubic(t) {
  return 1 - ((1 - t) ** 3)
}

function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - ((-2 * t + 2) ** 3) / 2
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function PageImage({ page, alt, className = '' }) {
  if (!page) return null

  return (
    <div className={`impact-sedco-page-face ${className}`}>
      <img
        src={pageImage(page)}
        alt={alt || (page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`)}
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
  const focusTimerRef = useRef(null)
  const pendingAutoRef = useRef(false)
  const stageRef = useRef(null)
  const leafRef = useRef(null)
  const bookRef = useRef(null)

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
    if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current)
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

  const pageWidth = useMemo(() => {
    // Resting page fills the phone like SEDCO. During a turn the whole two-page
    // book zooms out so both sheets become visible at once.
    return Math.round(Math.max(230, Math.min(308, viewportWidth * 0.72)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const spreadScale = useMemo(() => {
    const available = Math.max(280, viewportWidth - 34)
    return clamp(available / (pageWidth * 2), 0.54, 0.62)
  }, [viewportWidth, pageWidth])

  const clearAnimation = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    if (focusTimerRef.current) window.clearTimeout(focusTimerRef.current)
    focusTimerRef.current = null
  }

  const setStageFocus = (animate = false) => {
    const stage = stageRef.current
    if (!stage) return

    stage.style.transition = animate
      ? 'transform 230ms cubic-bezier(.22,.78,.24,1)'
      : 'none'
    stage.style.transform = `translate3d(${-pageWidth / 2}px, 0, 0) scale(1)`
  }

  const applyProgress = (value) => {
    const state = turnRef.current
    const stage = stageRef.current
    const leaf = leafRef.current
    const book = bookRef.current
    if (!state || !stage || !leaf || !book) return

    const progress = clamp(value, 0, 1)
    progressRef.current = progress

    // SEDCO first pulls back to show the whole book, then turns the sheet.
    // This is the visual detail that makes it read as a physical booklet instead
    // of a single card rotating in place.
    const openPhase = easeOutCubic(clamp(progress / 0.34, 0, 1))
    const scale = 1 - ((1 - spreadScale) * openPhase)
    const translateX = (-pageWidth / 2) * (1 - openPhase)

    stage.style.transition = 'none'
    stage.style.transform = `translate3d(${translateX}px, 0, 0) scale(${scale})`

    const angle = state.direction === 1
      ? -180 * progress
      : -180 + (180 * progress)

    leaf.style.transition = 'none'
    leaf.style.transform = `rotateY(${angle}deg) translateZ(1px)`

    const fold = Math.sin(Math.PI * Math.min(progress, 0.999))
    book.style.setProperty('--sedco-fold', String(fold))
    book.style.setProperty('--sedco-progress', String(progress))
  }

  const animateProgress = (destination, duration, onDone) => {
    clearAnimation()
    const from = progressRef.current
    const startedAt = performance.now()

    const tick = (now) => {
      const elapsed = now - startedAt
      const linear = clamp(elapsed / duration, 0, 1)
      const eased = easeInOutCubic(linear)
      const value = from + ((destination - from) * eased)
      applyProgress(value)

      if (linear < 1) {
        animationRef.current = requestAnimationFrame(tick)
      } else {
        animationRef.current = null
        onDone?.()
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  const finishToTarget = () => {
    const state = turnRef.current
    if (!state) return

    setIsDragging(false)
    setIsSettling(true)

    // Hold the fully-open spread for a beat, then zoom into the new right page.
    // This is the same visual rhythm visible in the SEDCO recording.
    focusTimerRef.current = window.setTimeout(() => {
      setStageFocus(true)

      focusTimerRef.current = window.setTimeout(() => {
        const target = clamp(state.target, 1, totalPages)
        activePageRef.current = target
        turnRef.current = null
        progressRef.current = 0
        setActivePage(target)
        setTurn(null)
        setIsSettling(false)
        bookRef.current?.style.setProperty('--sedco-fold', '0')
        bookRef.current?.style.setProperty('--sedco-progress', '0')
        onPageChange?.(target)
      }, 245)
    }, 42)
  }

  const cancelTurn = () => {
    const state = turnRef.current
    if (!state) return

    setIsDragging(false)
    setIsSettling(true)
    const duration = Math.max(150, 330 * progressRef.current)

    animateProgress(0, duration, () => {
      turnRef.current = null
      progressRef.current = 0
      setTurn(null)
      setIsSettling(false)
      setStageFocus(false)
      bookRef.current?.style.setProperty('--sedco-fold', '0')
      bookRef.current?.style.setProperty('--sedco-progress', '0')
    })
  }

  const completeTurn = () => {
    const remaining = 1 - progressRef.current
    const duration = Math.max(210, 460 * remaining)
    setIsDragging(false)
    setIsSettling(true)
    animateProgress(1, duration, finishToTarget)
  }

  const makeTurn = (direction) => {
    const from = activePageRef.current
    const target = from + direction
    if (target < 1 || target > totalPages) return null
    return { direction, from, target }
  }

  const beginTurn = (direction, auto = false) => {
    if (turnRef.current || isSettling) return false
    const next = makeTurn(direction)
    if (!next) return false

    turnRef.current = next
    progressRef.current = 0
    pendingAutoRef.current = auto
    setTurn(next)
    return true
  }

  useLayoutEffect(() => {
    if (!turn) {
      setStageFocus(false)
      return
    }

    applyProgress(progressRef.current)

    if (pendingAutoRef.current) {
      pendingAutoRef.current = false
      onPageTurn?.()
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          completeTurn()
        })
      })
    }
  }, [turn, pageWidth, spreadScale])

  useLayoutEffect(() => {
    if (!turnRef.current) setStageFocus(false)
  }, [pageWidth])

  useImperativeHandle(ref, () => ({
    goTo(page) {
      clearAnimation()
      const target = clamp(Number(page) || 1, 1, totalPages)
      activePageRef.current = target
      turnRef.current = null
      progressRef.current = 0
      setActivePage(target)
      setTurn(null)
      setIsDragging(false)
      setIsSettling(false)
      requestAnimationFrame(() => setStageFocus(false))
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

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY

    if (gesture.locked === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.06 ? 'horizontal' : 'vertical'
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
    gesture.velocityX = (event.clientX - gesture.lastX) / dt
    gesture.lastX = event.clientX
    gesture.lastTime = now

    const distance = gesture.direction === 1
      ? Math.max(0, -dx)
      : Math.max(0, dx)

    const progress = clamp(distance / (pageWidth * 0.74), 0, 1)

    if (!gesture.soundPlayed && progress > 0.045) {
      onPageTurn?.()
      gesture.soundPlayed = true
    }

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

    const shouldComplete = progressRef.current > 0.16 || directionalVelocity > 0.28
    if (shouldComplete) completeTurn()
    else cancelTurn()
  }

  const rightPage = turn
    ? (turn.direction === 1 ? turn.target : activePage)
    : activePage

  const leafPage = turn
    ? (turn.direction === 1 ? activePage : turn.target)
    : null

  return (
    <div
      className={`impact-sedco-mobile-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}`}
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
        '--sedco-spread-scale': spreadScale,
      }}
      aria-label={`Impact Report page ${activePage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishGesture}
      onPointerCancel={finishGesture}
    >
      <div
        ref={stageRef}
        className="impact-sedco-book-stage"
        style={{ width: pageWidth * 2, height: pageHeight }}
      >
        <div ref={bookRef} className="impact-sedco-book-spread">
          <div className="impact-sedco-left-bed" aria-hidden="true" />

          <div className="impact-sedco-right-stack impact-sedco-right-stack--3" aria-hidden="true" />
          <div className="impact-sedco-right-stack impact-sedco-right-stack--2" aria-hidden="true" />
          <div className="impact-sedco-right-stack impact-sedco-right-stack--1" aria-hidden="true" />

          <div className="impact-sedco-static-page">
            <PageImage page={rightPage} className="impact-sedco-static-page__face" />
          </div>

          {leafPage && (
            <div ref={leafRef} className="impact-sedco-turning-leaf">
              <PageImage page={leafPage} className="impact-sedco-turning-leaf__front" />
              <PageImage page={leafPage} className="impact-sedco-turning-leaf__back" />
              <span className="impact-sedco-leaf-edge" aria-hidden="true" />
            </div>
          )}

          <span className="impact-sedco-center-spine" aria-hidden="true" />
        </div>
      </div>
    </div>
  )
})

export default MobileImpactSlider
