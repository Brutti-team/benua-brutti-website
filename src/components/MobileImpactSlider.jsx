import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

const MobileReportPage = forwardRef(function MobileReportPage({ page, totalPages }, ref) {
  const isCover = page === 1 || page === totalPages
  const src = `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  return (
    <div
      ref={ref}
      className={`impact-mobile-flip-page${isCover ? ' impact-mobile-flip-page--cover' : ''}`}
      data-density={isCover ? 'hard' : 'soft'}
    >
      <img
        src={src}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading={page <= 8 ? 'eager' : 'lazy'}
        fetchPriority={page <= 3 ? 'high' : 'auto'}
      />
    </div>
  )
})

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const bookRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const pageWidth = useMemo(() => {
    // SEDCO keeps a landscape two-page book on phones. Each physical page is
    // intentionally wider than half the viewport so the open spread clips at
    // the sides, while the closed cover sits on the right half of the book.
    return Math.round(Math.max(250, Math.min(332, viewportWidth * 0.76)))
  }, [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])

  const pageFlip = () => bookRef.current?.pageFlip?.()

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = Math.max(1, Math.min(totalPages, Number(page)))
      pageFlip()?.turnToPage(target - 1)
    },
    next() {
      pageFlip()?.flipNext('top')
    },
    previous() {
      pageFlip()?.flipPrev('top')
    },
  }))

  const handleFlip = (event) => {
    const nextPage = Math.max(1, Math.min(totalPages, Number(event.data) + 1))
    onPageChange?.(nextPage)
  }

  const handleStateChange = (event) => {
    const state = event.data
    const turning = state === 'user_fold' || state === 'flipping'

    if (turning && !soundPlayedRef.current) {
      onPageTurn?.()
      soundPlayedRef.current = true
    }

    if (state === 'read') {
      soundPlayedRef.current = false
    }
  }

  return (
    <div
      className="impact-mobile-sedco-book"
      aria-label="Impact Report mobile book viewer"
      style={{
        '--impact-mobile-page-width': `${pageWidth}px`,
        '--impact-mobile-page-height': `${pageHeight}px`,
      }}
    >
      <HTMLFlipBook
        key={`${pageWidth}x${pageHeight}`}
        ref={bookRef}
        width={pageWidth}
        height={pageHeight}
        size="fixed"
        minWidth={pageWidth}
        maxWidth={pageWidth}
        minHeight={pageHeight}
        maxHeight={pageHeight}
        startPage={Math.max(0, Math.min(totalPages - 1, currentPage - 1))}
        drawShadow
        flippingTime={860}
        usePortrait={false}
        startZIndex={10}
        autoSize={false}
        maxShadowOpacity={0.52}
        showCover
        mobileScrollSupport
        clickEventForward={false}
        useMouseEvents
        swipeDistance={16}
        showPageCorners
        disableFlipByClick={false}
        className="impact-sedco-flipbook"
        onFlip={handleFlip}
        onChangeState={handleStateChange}
      >
        {Array.from({ length: totalPages }, (_, index) => (
          <MobileReportPage
            page={index + 1}
            totalPages={totalPages}
            key={index + 1}
          />
        ))}
      </HTMLFlipBook>
    </div>
  )
})

export default MobileImpactSlider
