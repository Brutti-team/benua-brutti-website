import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'

const MobileReportPage = forwardRef(function MobileReportPage({ page }, ref) {
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
    const syncWidth = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', syncWidth, { passive: true })
    return () => window.removeEventListener('resize', syncWidth)
  }, [])

  const pageWidth = useMemo(() => {
    // Match the SEDCO Directory phone reader: one complete portrait page,
    // centred with enough grey margin for the page curl to be visible.
    return Math.round(Math.max(220, Math.min(300, viewportWidth * 0.69)))
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
    const page = Math.max(1, Math.min(totalPages, Number(event.data) + 1))
    onPageChange?.(page)
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
      aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
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
        flippingTime={720}
        usePortrait
        startZIndex={10}
        autoSize={false}
        maxShadowOpacity={0.55}
        showCover={false}
        mobileScrollSupport
        clickEventForward={false}
        useMouseEvents
        swipeDistance={10}
        showPageCorners
        disableFlipByClick
        className="impact-sedco-mobile-flipbook"
        onFlip={handleFlip}
        onChangeState={handleStateChange}
      >
        {Array.from({ length: totalPages }, (_, index) => (
          <MobileReportPage page={index + 1} key={index + 1} />
        ))}
      </HTMLFlipBook>
    </div>
  )
})

export default MobileImpactSlider
