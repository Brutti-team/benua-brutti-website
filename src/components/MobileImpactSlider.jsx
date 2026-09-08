import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'

const MobileReportPage = forwardRef(function MobileReportPage({ page, totalPages }, ref) {
  const isCover = page === 1 || page === totalPages
  const pageImage = `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  return (
    <div
      ref={ref}
      className={`impact-flip-page impact-flip-page--mobile${isCover ? ' impact-flip-page--cover' : ''}`}
      data-density={isCover ? 'hard' : 'soft'}
    >
      <img
        src={pageImage}
        alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
        draggable="false"
        decoding="async"
        loading={page <= 3 ? 'eager' : 'lazy'}
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
  const lastPageRef = useRef(currentPage)
  const gestureSoundPlayedRef = useRef(false)

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

  useEffect(() => {
    lastPageRef.current = currentPage
  }, [currentPage])

  useEffect(() => {
    const target = Math.max(1, Math.min(totalPages, Number(currentPage)))
    if (target <= 1) return undefined

    const frame = requestAnimationFrame(() => {
      pageFlip()?.turnToPage(target - 1)
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  const handleFlip = (event) => {
    const nextPage = Math.max(1, Math.min(totalPages, event.data + 1))
    lastPageRef.current = nextPage
    onPageChange?.(nextPage)
  }

  const handleStateChange = (event) => {
    const state = event.data
    const turning = state === 'user_fold' || state === 'flipping'

    if (turning && !gestureSoundPlayedRef.current) {
      onPageTurn?.()
      gestureSoundPlayedRef.current = true
    }

    if (state === 'read') {
      gestureSoundPlayedRef.current = false
    }
  }

  return (
    <div className="impact-mobile-book" aria-label="Impact Report mobile book viewer">
      <HTMLFlipBook
        ref={bookRef}
        width={330}
        height={467}
        size="fixed"
        startPage={Math.max(0, Math.min(totalPages - 1, currentPage - 1))}
        drawShadow
        flippingTime={780}
        usePortrait={false}
        startZIndex={10}
        autoSize={false}
        maxShadowOpacity={0.42}
        showCover
        mobileScrollSupport
        clickEventForward={false}
        useMouseEvents
        swipeDistance={22}
        showPageCorners
        disableFlipByClick={false}
        className="impact-html-flipbook impact-html-flipbook--mobile"
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
