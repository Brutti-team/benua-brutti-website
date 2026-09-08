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
  const scrollTimerRef = useRef(null)
  const scrollFrameRef = useRef(null)

  const pageImage = (page) => `${import.meta.env.BASE_URL}assets/impact-report/page-${String(page).padStart(2, '0')}.webp`

  const getSlides = () => {
    const track = trackRef.current
    if (!track) return []
    return Array.from(track.querySelectorAll('.impact-mobile-slider__slide'))
  }

  const scrollToPage = (page, behavior = 'smooth') => {
    const track = trackRef.current
    if (!track) return

    const targetPage = Math.max(1, Math.min(totalPages, Number(page)))
    const slide = getSlides()[targetPage - 1]
    if (!slide) return

    const left = slide.offsetLeft - (track.clientWidth - slide.offsetWidth) / 2
    track.scrollTo({ left, behavior })
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
      resizeTimerRef.current = window.setTimeout(() => {
        scrollToPage(lastPageRef.current, 'auto')
      }, 90)
    }

    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollFrameRef.current)
      window.clearTimeout(resizeTimerRef.current)
      window.clearTimeout(scrollTimerRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const resolveNearestPage = () => {
    const track = trackRef.current
    if (!track) return

    const viewportCenter = track.scrollLeft + track.clientWidth / 2
    const slides = getSlides()
    if (!slides.length) return

    let closestIndex = 0
    let closestDistance = Infinity

    slides.forEach((slide, index) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2
      const distance = Math.abs(slideCenter - viewportCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })

    const nextPage = closestIndex + 1
    if (nextPage === lastPageRef.current) return

    lastPageRef.current = nextPage
    onPageChange?.(nextPage)
    onPageTurn?.()
  }

  const handleScroll = () => {
    cancelAnimationFrame(scrollFrameRef.current)
    scrollFrameRef.current = requestAnimationFrame(resolveNearestPage)

    window.clearTimeout(scrollTimerRef.current)
    scrollTimerRef.current = window.setTimeout(resolveNearestPage, 80)
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
                  loading={page <= 4 ? 'eager' : 'lazy'}
                  fetchPriority={page <= 2 ? 'high' : 'auto'}
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
