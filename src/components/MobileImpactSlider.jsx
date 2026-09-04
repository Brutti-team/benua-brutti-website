import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

const MobileImpactSlider = forwardRef(function MobileImpactSlider({
  totalPages,
  currentPage,
  onPageChange,
  onPageTurn,
}, ref) {
  const trackRef = useRef(null)
  const lastPageRef = useRef(currentPage)
  const resizeTimerRef = useRef(null)

  const pageImage = (page) => `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  const scrollToPage = (page, behavior = 'smooth') => {
    const track = trackRef.current
    if (!track) return

    const target = Math.max(1, Math.min(totalPages, Number(page)))
    track.scrollTo({
      left: (target - 1) * track.clientWidth,
      behavior,
    })
  }

  useImperativeHandle(ref, () => ({
    goTo(page, behavior = 'smooth') {
      scrollToPage(page, behavior)
    },
    next() {
      scrollToPage(Math.min(totalPages, lastPageRef.current + 1))
    },
    previous() {
      scrollToPage(Math.max(1, lastPageRef.current - 1))
    },
  }))

  useEffect(() => {
    lastPageRef.current = currentPage
  }, [currentPage])

  useEffect(() => {
    const raf = requestAnimationFrame(() => scrollToPage(currentPage, 'auto'))

    const onResize = () => {
      window.clearTimeout(resizeTimerRef.current)
      resizeTimerRef.current = window.setTimeout(() => scrollToPage(lastPageRef.current, 'auto'), 80)
    }

    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(resizeTimerRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const handleScroll = () => {
    const track = trackRef.current
    if (!track || !track.clientWidth) return

    const nextPage = Math.max(
      1,
      Math.min(totalPages, Math.round(track.scrollLeft / track.clientWidth) + 1),
    )

    if (nextPage === lastPageRef.current) return

    lastPageRef.current = nextPage
    onPageChange?.(nextPage)
    onPageTurn?.()
  }

  return (
    <div className="impact-mobile-slider" aria-label="Impact Report mobile page viewer">
      <div
        ref={trackRef}
        className="impact-mobile-slider__track"
        onScroll={handleScroll}
      >
        {Array.from({ length: totalPages }, (_, index) => {
          const page = index + 1
          return (
            <div className="impact-mobile-slider__slide" key={page}>
              <div className="impact-mobile-slider__paper">
                <img
                  src={pageImage(page)}
                  alt={page === 1 ? 'Brutti Impact Report 2026 cover' : `Brutti Impact Report 2026 page ${page}`}
                  draggable="false"
                  decoding="async"
                  loading={page <= 3 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})

export default MobileImpactSlider
