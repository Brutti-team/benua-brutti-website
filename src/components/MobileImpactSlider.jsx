import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import '../impact-report-sedco-exact.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

function ExactPage({ page, className = '' }) {
  if (!page) return null

  return (
    <div className={`sedco-exact-page ${className}`}>
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
  const bookRef = useRef(null)
  const topPageRef = useRef(null)
  const foldRef = useRef(null)
  const shadowRef = useRef(null)
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
    Math.round(Math.max(232, Math.min(310, viewportWidth * 0.72)))
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
    const topPage = topPageRef.current
    const book = bookRef.current
    const fold = foldRef.current
    const shadow = shadowRef.current
    if (!state || !topPage || !book || !fold || !shadow) return

    const progress = clamp(rawProgress, 0, 1)
    progressRef.current = progress

    // Reference SEDCO behaviour: the book NEVER zooms out. A full-size page stays
    // fixed in the frame while the visible edge travels horizontally across it.
    // The outgoing page is clipped away from the RIGHT; going back is the exact
    // reverse, with the previous page revealing from the LEFT.
    const seam = state.direction === 1
      ? pageWidth * (1 - progress)
      : pageWidth * progress

    if (state.direction === 1) {
      topPage.style.clipPath = `inset(0 ${(progress * 100).toFixed(4)}% 0 0)`
      topPage.style.webkitClipPath = `inset(0 ${(progress * 100).toFixed(4)}% 0 0)`
    } else {
      topPage.style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(4)}% 0 0)`
      topPage.style.webkitClipPath = `inset(0 ${((1 - progress) * 100).toFixed(4)}% 0 0)`
    }

    // The SEDCO edge is narrow and weighted, not a large 3D rotation. It becomes
    // strongest in the middle of the turn and disappears again when the sheet lands.
    const bend = Math.sin(Math.PI * progress)
    const directionSign = state.direction === 1 ? 1 : -1
    fold.style.transform = `translate3d(${seam - 8}px, 0, 0) skewY(${directionSign * bend * 0.7}deg) scaleX(${1 + bend * 0.26})`
    fold.style.opacity = String(0.10 + bend * 0.88)

    shadow.style.transform = `translate3d(${seam - 1}px, 0, 0)`
    shadow.style.opacity = String(bend * 0.74)

    book.style.setProperty('--sedco-exact-progress', String(progress))
    book.style.setProperty('--sedco-exact-bend', String(bend))
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
      // SEDCO accelerates quickly from the finger and decelerates gently into the page.
      const eased = 1 - Math.pow(1 - t, 3.05)
      applyProgress(from + ((destination - from) * eased))

      if (t < 1) animationRef.current = requestAnimationFrame(tick)
      else {
        animationRef.current = null
        onDone?.()
      }
    }

    animationRef.current = requestAnimationFrame(tick)
  }

  const resetVisuals = () => {
    progressRef.current = 0
    const topPage = topPageRef.current
    const fold = foldRef.current
    const shadow = shadowRef.current
    if (topPage) {
      topPage.style.clipPath = 'inset(0 0 0 0)'
      topPage.style.webkitClipPath = 'inset(0 0 0 0)'
    }
    if (fold) {
      fold.style.transform = 'translate3d(0,0,0)'
      fold.style.opacity = '0'
    }
    if (shadow) {
      shadow.style.transform = 'translate3d(0,0,0)'
      shadow.style.opacity = '0'
    }
    bookRef.current?.style.setProperty('--sedco-exact-progress', '0')
    bookRef.current?.style.setProperty('--sedco-exact-bend', '0')
  }

  const commitTurn = () => {
    const state = turnRef.current
    if (!state) return

    const target = clamp(state.target, 1, totalPages)
    activePageRef.current = target
    turnRef.current = null
    setActivePage(target)
    setTurn(null)
    setIsDragging(false)
    setIsSettling(false)
    requestAnimationFrame(resetVisuals)
    onPageChange?.(target)
  }

  const cancelTurn = () => {
    if (!turnRef.current) return
    setIsDragging(false)
    setIsSettling(true)

    const distance = progressRef.current
    const duration = clamp(90 + distance * 155, 95, 235)
    animateProgress(0, duration, () => {
      turnRef.current = null
      setTurn(null)
      setIsSettling(false)
      requestAnimationFrame(resetVisuals)
    })
  }

  const completeTurn = () => {
    if (!turnRef.current) return
    setIsDragging(false)
    setIsSettling(true)

    const remaining = 1 - progressRef.current
    // The reference turn is fast: about 0.25–0.32 s once released.
    const duration = clamp(115 + remaining * 205, 120, 320)
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
    requestAnimationFrame(() => {
      applyProgress(progressRef.current)
      if (pendingAutoRef.current) {
        pendingAutoRef.current = false
        onPageTurn?.()
        requestAnimationFrame(() => completeTurn())
      }
    })
  }, [turn, pageWidth])

  useImperativeHandle(ref, () => ({
    goTo(page) {
      clearAnimation()
      const target = clamp(Number(page) || 1, 1, totalPages)
      activePageRef.current = target
      turnRef.current = null
      setActivePage(target)
      setTurn(null)
      setIsDragging(false)
      setIsSettling(false)
      requestAnimationFrame(resetVisuals)
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

    if (gesture.locked === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.03 ? 'horizontal' : 'vertical'
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

    // SEDCO reaches the next page with a relatively short, confident swipe.
    const progress = clamp(distance / (pageWidth * 0.70), 0, 1)

    if (!gesture.soundPlayed && progress > 0.06) {
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

    const shouldComplete = progressRef.current > 0.16 || directionalVelocity > 0.22
    if (shouldComplete) completeTurn()
    else cancelTurn()
  }

  const underPage = turn
    ? (turn.direction === 1 ? turn.target : activePage)
    : activePage

  const topPage = turn
    ? (turn.direction === 1 ? activePage : turn.target)
    : activePage

  return (
    <div
      className={`impact-sedco-mobile-viewer sedco-exact-viewer${isDragging ? ' is-dragging' : ''}${isSettling ? ' is-settling' : ''}`}
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
      <div ref={bookRef} className="sedco-exact-book">
        <div className="sedco-exact-stack sedco-exact-stack--3" aria-hidden="true" />
        <div className="sedco-exact-stack sedco-exact-stack--2" aria-hidden="true" />
        <div className="sedco-exact-stack sedco-exact-stack--1" aria-hidden="true" />

        <ExactPage page={underPage} className="sedco-exact-page--under" />

        <div ref={topPageRef} className="sedco-exact-page sedco-exact-page--top">
          <img
            src={pageImage(topPage)}
            alt={topPage === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${topPage}`}
            draggable="false"
            decoding="async"
            loading="eager"
          />
        </div>

        <span ref={shadowRef} className="sedco-exact-seam-shadow" aria-hidden="true" />
        <span ref={foldRef} className="sedco-exact-fold" aria-hidden="true" />
        <span className="sedco-exact-left-edge" aria-hidden="true" />
      </div>
    </div>
  )
})

export default MobileImpactSlider
