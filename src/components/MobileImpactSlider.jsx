import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-sedco-native.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const SedcoPage = forwardRef(function SedcoPage({ page, totalPages, forceSoft = false }, ref) {
  const isCover = !forceSoft && (page === 1 || page === totalPages)

  return (
    <div
      ref={ref}
      className={`sedco-native-page${isCover ? ' sedco-native-page--cover' : ''}`}
      data-density={isCover ? 'hard' : 'soft'}
    >
      <img
        src={pageImage(page)}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading={page <= 5 ? 'eager' : 'lazy'}
        fetchPriority={page <= 2 ? 'high' : 'auto'}
      />
    </div>
  )
})

function StaticSpread({ leftPage, rightPage, totalPages }) {
  return (
    <div className="sedco-native-static-spread" aria-hidden="true">
      <div className="sedco-native-static-page sedco-native-static-page--left">
        <img src={pageImage(leftPage)} alt="" draggable="false" />
      </div>
      <div className="sedco-native-static-page sedco-native-static-page--right">
        {rightPage <= totalPages && (
          <img src={pageImage(rightPage)} alt="" draggable="false" />
        )}
      </div>
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const coverFlipRef = useRef(null)
  const spreadFlipRef = useRef(null)
  const cameraRef = useRef(null)
  const gestureRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const [isTurning, setIsTurning] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))
  const [cameraSide, setCameraSide] = useState(() => (
    currentPage > 1 && currentPage % 2 === 1 ? 'right' : 'left'
  ))

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', sync, { passive: true })
    return () => window.removeEventListener('resize', sync)
  }, [])

  // Keep the approved cover and real two-page book structure, but make each
  // open page large again. The phone camera focuses one page at a time like
  // the supplied SEDCO reference: left page first, then right page, then flip.
  const coverPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const spreadPageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const pageWidth = currentPage === 1 ? coverPageWidth : spreadPageWidth
  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])

  // The book itself stays as two clean side-by-side pages. Only the camera
  // pans across the spread, so one page is zoomed/focused at a time.
  const cameraTravel = currentPage === 1 ? 0 : Math.max(0, spreadPageWidth - peekWidth)
  const cameraLeftX = 0
  const cameraRightX = -cameraTravel

  const spreadStartPage = currentPage <= 1
    ? 2
    : currentPage % 2 === 0
      ? currentPage
      : currentPage - 1

  useEffect(() => {
    if (currentPage <= 1) return
    setCameraSide(currentPage % 2 === 1 ? 'right' : 'left')
  }, [currentPage])

  const setCameraTransform = (x, animate = true) => {
    if (!cameraRef.current) return
    cameraRef.current.style.transition = animate
      ? 'transform 420ms cubic-bezier(.22,.82,.24,1)'
      : 'none'
    cameraRef.current.style.transform = `translate3d(${x}px,0,0)`
  }

  const snapCamera = (side, animate = true) => {
    const x = side === 'right' ? cameraRightX : cameraLeftX
    setCameraSide(side)
    setCameraTransform(x, animate)
  }

  useEffect(() => {
    if (currentPage <= 1) return
    requestAnimationFrame(() => {
      snapCamera(currentPage % 2 === 1 ? 'right' : 'left', false)
    })
  }, [pageWidth])

  const spreadFlip = () => spreadFlipRef.current?.pageFlip?.()
  const coverFlip = () => coverFlipRef.current?.pageFlip?.()

  const moveToNextStep = () => {
    if (isTurning) return

    if (currentPage === 1) {
      coverFlip()?.flipNext('top')
      return
    }

    // First swipe: stay on the same physical spread and move the camera from
    // the left page to the right page. No sheet turns yet.
    if (cameraSide === 'left' && spreadStartPage + 1 <= totalPages) {
      snapCamera('right', true)
      onPageChange?.(Math.min(totalPages, spreadStartPage + 1))
      return
    }

    // Second swipe: after the right page has been read, turn that sheet to the
    // next physical spread, then focus the new left page.
    if (cameraSide === 'right' && spreadStartPage + 2 <= totalPages) {
      onPageTurn?.()
      soundPlayedRef.current = true
      setIsTurning(true)
      spreadFlip()?.flipNext('top')
    }
  }

  const moveToPreviousStep = () => {
    if (isTurning || currentPage <= 1) return

    if (cameraSide === 'right') {
      snapCamera('left', true)
      onPageChange?.(spreadStartPage)
      return
    }

    if (spreadStartPage <= 2) {
      onPageChange?.(1)
      return
    }

    onPageTurn?.()
    soundPlayedRef.current = true
    setIsTurning(true)
    spreadFlip()?.flipPrev('top')
  }

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      if (target === 1) {
        onPageChange?.(1)
        return
      }

      const spread = target % 2 === 0 ? target : target - 1
      spreadFlip()?.turnToPage(Math.max(0, spread - 2))
      requestAnimationFrame(() => {
        snapCamera(target % 2 === 1 ? 'right' : 'left', false)
      })
    },
    next() {
      moveToNextStep()
    },
    previous() {
      moveToPreviousStep()
    },
  }))

  const handlePointerDown = (event) => {
    if (isTurning) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      locked: null,
    }

    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId || isTurning) return

    const dx = event.clientX - gesture.startX
    const dy = event.clientY - gesture.startY

    if (gesture.locked === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      gesture.locked = Math.abs(dx) > Math.abs(dy) * 1.05 ? 'horizontal' : 'vertical'
    }

    if (gesture.locked !== 'horizontal') return

    if (currentPage > 1 && cameraSide === 'left' && dx < 0) {
      setCameraTransform(clamp(cameraLeftX + dx, cameraRightX, cameraLeftX), false)
      return
    }

    if (currentPage > 1 && cameraSide === 'right' && dx > 0) {
      setCameraTransform(clamp(cameraRightX + dx, cameraRightX, cameraLeftX), false)
    }
  }

  const handlePointerEnd = (event) => {
    const gesture = gestureRef.current
    if (!gesture || gesture.pointerId !== event.pointerId) return

    gestureRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (gesture.locked !== 'horizontal') return

    const dx = event.clientX - gesture.startX
    const threshold = Math.max(34, spreadPageWidth * 0.14)

    if (dx <= -threshold) {
      moveToNextStep()
      return
    }

    if (dx >= threshold) {
      moveToPreviousStep()
      return
    }

    if (currentPage > 1) snapCamera(cameraSide, true)
  }

  if (currentPage === 1) {
    return (
      <div
        className="sedco-native-viewer is-cover"
        style={{
          '--sedco-native-page-w': `${pageWidth}px`,
          '--sedco-native-page-h': `${pageHeight}px`,
          '--sedco-native-peek-w': `${peekWidth}px`,
        }}
        aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div className="sedco-native-holder sedco-native-holder--cover">
          <div className="sedco-native-book-bed" aria-hidden="true" />
          <div className="sedco-native-paper-edge sedco-native-paper-edge--1" aria-hidden="true" />
          <div className="sedco-native-paper-edge sedco-native-paper-edge--2" aria-hidden="true" />

          <HTMLFlipBook
            ref={coverFlipRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            startPage={0}
            drawShadow
            flippingTime={500}
            usePortrait
            startZIndex={40}
            autoSize={false}
            maxShadowOpacity={0.46}
            showCover
            mobileScrollSupport
            clickEventForward={false}
            useMouseEvents
            swipeDistance={6}
            showPageCorners
            disableFlipByClick
            className="sedco-native-flipbook"
            onFlip={(event) => {
              if (Number(event.data) >= 1) onPageChange?.(2)
            }}
            onChangeState={(event) => {
              const state = event.data
              const turning = state === 'user_fold' || state === 'flipping'
              setIsTurning(turning)

              if (turning && !soundPlayedRef.current) {
                onPageTurn?.()
                soundPlayedRef.current = true
              }

              if (state === 'read') {
                setIsTurning(false)
                soundPlayedRef.current = false
              }
            }}
          >
            <SedcoPage page={1} totalPages={totalPages} />
            <SedcoPage page={2} totalPages={totalPages} />
          </HTMLFlipBook>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`sedco-native-viewer is-open-book is-camera-${cameraSide}${isTurning ? ' is-turning' : ''}`}
      style={{
        '--sedco-native-page-w': `${pageWidth}px`,
        '--sedco-native-page-h': `${pageHeight}px`,
        '--sedco-native-peek-w': `${peekWidth}px`,
        '--sedco-native-camera-travel': `${cameraTravel}px`,
      }}
      aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
    >
      <div className="sedco-native-camera-window">
        <div ref={cameraRef} className="sedco-native-camera-track">
          <div className="sedco-native-spread-bed" aria-hidden="true" />

          <StaticSpread
            leftPage={spreadStartPage}
            rightPage={spreadStartPage + 1}
            totalPages={totalPages}
          />

          <HTMLFlipBook
            key={`spread-${spreadStartPage}-${pageWidth}`}
            ref={spreadFlipRef}
            width={pageWidth}
            height={pageHeight}
            size="fixed"
            minWidth={pageWidth}
            maxWidth={pageWidth}
            minHeight={pageHeight}
            maxHeight={pageHeight}
            startPage={Math.max(0, spreadStartPage - 2)}
            drawShadow
            flippingTime={540}
            usePortrait={false}
            startZIndex={40}
            autoSize={false}
            maxShadowOpacity={0.46}
            showCover={false}
            mobileScrollSupport={false}
            clickEventForward={false}
            useMouseEvents={false}
            swipeDistance={999}
            showPageCorners
            disableFlipByClick
            className="sedco-native-flipbook sedco-native-spread-flipbook"
            onFlip={(event) => {
              const page = clamp(Number(event.data) + 2, 2, totalPages)
              const leftPage = page % 2 === 0 ? page : Math.max(2, page - 1)
              requestAnimationFrame(() => snapCamera('left', false))
              onPageChange?.(leftPage)
            }}
            onChangeState={(event) => {
              const state = event.data
              const turning = state === 'user_fold' || state === 'flipping'
              setIsTurning(turning)

              if (turning && !soundPlayedRef.current) {
                onPageTurn?.()
                soundPlayedRef.current = true
              }

              if (state === 'read') {
                setIsTurning(false)
                soundPlayedRef.current = false
                requestAnimationFrame(() => snapCamera('left', false))
              }
            }}
          >
            {Array.from({ length: totalPages - 1 }, (_, index) => (
              <SedcoPage
                page={index + 2}
                totalPages={totalPages}
                forceSoft
                key={index + 2}
              />
            ))}
          </HTMLFlipBook>
        </div>
      </div>
    </div>
  )
})

export default MobileImpactSlider
