import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import HTMLFlipBook from 'react-pageflip'
import '../impact-report-sedco-native.css'

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function pageImage(page) {
  return `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`
}

const SedcoPage = forwardRef(function SedcoPage({ page }, ref) {
  return (
    <div ref={ref} className="sedco-native-page" data-density="soft">
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

function NextPagePeek({ page }) {
  if (!page) return null

  return (
    <div className="sedco-native-next-peek" aria-hidden="true">
      <img src={pageImage(page)} alt="" draggable="false" />
      <span className="sedco-native-next-peek__shade" />
    </div>
  )
}

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const flipRef = useRef(null)
  const soundPlayedRef = useRef(false)
  const [isTurning, setIsTurning] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(() => (
    typeof window === 'undefined' ? 390 : window.innerWidth
  ))

  useEffect(() => {
    const sync = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', sync, { passive: true })
    return () => window.removeEventListener('resize', sync)
  }, [])

  const pageWidth = useMemo(() => (
    Math.round(Math.max(248, Math.min(326, viewportWidth * 0.80)))
  ), [viewportWidth])

  const pageHeight = useMemo(() => Math.round(pageWidth * (632 / 447)), [pageWidth])
  const peekWidth = useMemo(() => Math.round(pageWidth * 0.115), [pageWidth])
  const pageFlip = () => flipRef.current?.pageFlip?.()

  const nextPeekPage = !isTurning && currentPage > 1 && currentPage < totalPages
    ? currentPage + 1
    : null

  useImperativeHandle(ref, () => ({
    goTo(page) {
      const target = clamp(Number(page) || 1, 1, totalPages)
      pageFlip()?.turnToPage(target - 1)
    },
    next() {
      pageFlip()?.flipNext('top')
    },
    previous() {
      pageFlip()?.flipPrev('top')
    },
  }))

  return (
    <div
      className={`sedco-native-viewer${currentPage === 1 ? ' is-cover' : ' is-open-book'}${isTurning ? ' is-turning' : ''}`}
      style={{
        '--sedco-native-page-w': `${pageWidth}px`,
        '--sedco-native-page-h': `${pageHeight}px`,
        '--sedco-native-peek-w': `${peekWidth}px`,
      }}
      aria-label={`Impact Report page ${currentPage} of ${totalPages}`}
    >
      <div className="sedco-native-holder">
        <div className="sedco-native-book-bed" aria-hidden="true" />
        <div className="sedco-native-paper-edge sedco-native-paper-edge--1" aria-hidden="true" />
        <div className="sedco-native-paper-edge sedco-native-paper-edge--2" aria-hidden="true" />

        <NextPagePeek page={nextPeekPage} />

        <HTMLFlipBook
          key={`${pageWidth}x${pageHeight}`}
          ref={flipRef}
          width={pageWidth}
          height={pageHeight}
          size="fixed"
          minWidth={pageWidth}
          maxWidth={pageWidth}
          minHeight={pageHeight}
          maxHeight={pageHeight}
          startPage={clamp(currentPage - 1, 0, totalPages - 1)}
          drawShadow
          flippingTime={500}
          usePortrait
          startZIndex={40}
          autoSize={false}
          maxShadowOpacity={0.46}
          showCover={false}
          mobileScrollSupport
          clickEventForward={false}
          useMouseEvents
          swipeDistance={6}
          showPageCorners
          disableFlipByClick
          className="sedco-native-flipbook"
          onFlip={(event) => {
            const page = clamp(Number(event.data) + 1, 1, totalPages)
            onPageChange?.(page)
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
          {Array.from({ length: totalPages }, (_, index) => (
            <SedcoPage page={index + 1} key={index + 1} />
          ))}
        </HTMLFlipBook>

        <span className="sedco-native-spine" aria-hidden="true" />
      </div>
    </div>
  )
})

export default MobileImpactSlider
