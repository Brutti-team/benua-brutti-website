import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

const MobileReportPage = forwardRef(function MobileReportPage({ page, totalPages }, ref) {
  const src = `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  return (
    <div ref={ref} className="impact-sedco-mobile-page" data-density="soft">
      <img
        src={src}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading={page <= 5 ? 'eager' : 'lazy'}
        fetchPriority={page <= 2 ? 'high' : 'auto'}
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
    // SEDCO mobile viewer keeps one full portrait page visible with generous
    // grey space around it. Keep Brutti's page in the same visual proportion.
    return Math.round(Math.max(228, Math.min(305, viewportWidth * 0.69)))
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
    onPageChange?.(Math.max(1, Math.min(totalPages, Number(event.data) + 1)))
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
      className="impact-sedco-mobile-viewer"
      style={{
        '--sedco-page-width': `${pageWidth}px`,
        '--sedco-page-height': `${pageHeight}px`,
      }}
      aria-label="Impact Report mobile flipbook"
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
        flippingTime={760}
        usePortrait
        startZIndex={10}
        autoSize={false}
        maxShadowOpacity={0.48}
        showCover={false}
        mobileScrollSupport
        clickEventForward={false}
        useMouseEvents
        swipeDistance={14}
        showPageCorners
        disableFlipByClick={false}
        className="impact-sedco-mobile-flipbook"
        onFlip={handleFlip}
        onChangeState={handleStateChange}
      >
        {Array.from({ length: totalPages }, (_, index) => (
          <MobileReportPage page={index + 1} totalPages={totalPages} key={index + 1} />
        ))}
      </HTMLFlipBook>
    </div>
  )
})

export default MobileImpactSlider
