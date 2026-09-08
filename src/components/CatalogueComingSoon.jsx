import { forwardRef, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import HTMLFlipBook from 'react-pageflip'
import '../catalogue-coming-clean.css'
import '../catalogue-mobile-flip.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const categories = ['Furniture', 'Custom Work', 'Spaces', 'Projects']

const mobileCataloguePages = [
  {
    image: 'what-we-build/memento.webp',
    kicker: 'BRUTTI CATALOG',
    title: 'The Brutti Collection',
    meta: 'Furniture · Custom Work · Spaces · Projects',
    cover: true,
  },
  {
    image: 'what-we-build/table & counters.webp',
    kicker: '01 · FURNITURE',
    title: 'Furniture',
    meta: 'Functional pieces, made to live longer.',
  },
  {
    image: 'what-we-build/built in cabinet.webp',
    kicker: '02 · CUSTOM WORK',
    title: 'Custom Work',
    meta: 'Built around the space, purpose and people.',
  },
  {
    image: 'what-we-build/our camper.webp',
    kicker: '03 · SPACES',
    title: 'Spaces',
    meta: 'Ideas shaped into useful, memorable spaces.',
  },
  {
    image: 'what-we-build/builders & partner event.webp',
    kicker: '04 · PROJECTS',
    title: 'Projects',
    meta: 'Selected work from Brutti and our collaborators.',
  },
  {
    image: 'what-we-build/others.webp',
    kicker: 'THE BRUTTI COLLECTION',
    title: 'Coming soon.',
    meta: 'The full digital catalogue is on its way.',
    cover: true,
  },
]

const revealViewport = { once: false, amount: 0.65, margin: '0px 0px -8% 0px' }

const CatalogueFlipPage = forwardRef(function CatalogueFlipPage({ page }, ref) {
  return (
    <div
      ref={ref}
      className={`catalogue-mobile-page${page.cover ? ' catalogue-mobile-page--cover' : ''}`}
      data-density={page.cover ? 'hard' : 'soft'}
    >
      <img src={asset(page.image)} alt="" draggable="false" decoding="async" loading="lazy" />
      <div className="catalogue-mobile-page__shade" />
      <div className="catalogue-mobile-page__copy">
        <span>{page.kicker}</span>
        <strong>{page.title}</strong>
        <p>{page.meta}</p>
      </div>
    </div>
  )
})

export default function CatalogueComingSoon() {
  const mobileBookRef = useRef(null)
  const [mobilePage, setMobilePage] = useState(1)

  const previousMobilePage = () => {
    mobileBookRef.current?.pageFlip?.()?.flipPrev('top')
  }

  const nextMobilePage = () => {
    mobileBookRef.current?.pageFlip?.()?.flipNext('top')
  }

  return (
    <section className="catalogue-coming section-pad" aria-labelledby="catalogue-coming-title">
      <div className="catalogue-coming__ambient catalogue-coming__ambient--one" aria-hidden="true" />
      <div className="catalogue-coming__ambient catalogue-coming__ambient--two" aria-hidden="true" />

      <div className="page-shell catalogue-coming__shell">
        <div className="catalogue-coming__intro">
          <motion.p
            className="eyebrow catalogue-coming__eyebrow"
            initial={{ opacity: 0, y: 14, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={revealViewport}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Brutti Catalog
          </motion.p>

          <h2 id="catalogue-coming-title">
            <motion.span
              style={{ display: 'inline-block' }}
              initial={{ opacity: 0, y: 34, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={revealViewport}
              transition={{ duration: 0.72, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              Our catalog is
            </motion.span>{' '}
            <motion.em
              initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={revealViewport}
              transition={{ duration: 0.8, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              coming soon.
            </motion.em>
          </h2>

          <motion.p
            className="catalogue-coming__lead"
            initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={revealViewport}
            transition={{ duration: 0.65, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            A curated collection of Benua Brutti furniture, custom work, spaces and projects, gathered in one place.
          </motion.p>

          <div className="catalogue-coming__categories" aria-label="Catalogue categories">
            {categories.map((category, index) => (
              <motion.span
                key={category}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.8, margin: '0px 0px -8% 0px' }}
                transition={{
                  duration: 0.48,
                  delay: 0.36 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {category}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          className="catalogue-coming__media catalogue-coming__media--desktop"
          initial={{ opacity: 0, y: 36, scale: 0.99 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -2 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <video
            className="catalogue-coming__video"
            src={asset('vid catalog.MOV')}
            poster={asset('catalogue-poster.jpg')}
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-label="Preview of Benua Brutti furniture and showroom"
          />
          <div className="catalogue-coming__shade" />

          <div className="catalogue-coming__media-top">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.65 }}
            >
              A glimpse of what&apos;s coming
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.65 }}
            >
              Preview 01
            </motion.span>
          </div>

          <div className="catalogue-coming__media-bottom">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.44, duration: 0.7 }}
            >
              <span className="catalogue-coming__mini">THE BRUTTI COLLECTION</span>
              <strong>Furniture · Custom Work · Spaces · Projects</strong>
            </motion.div>
            <motion.span
              className="catalogue-coming__pill"
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.54, duration: 0.55 }}
            >
              COMING SOON
            </motion.span>
          </div>
        </motion.div>

        <div className="catalogue-coming__mobile-book" aria-label="Swipeable Brutti catalogue preview">
          <div className="catalogue-mobile-book__stage">
            <button
              type="button"
              className="catalogue-mobile-book__edge catalogue-mobile-book__edge--left"
              onClick={previousMobilePage}
              disabled={mobilePage <= 1}
              aria-label="Previous catalogue page"
            >
              ‹
            </button>

            <HTMLFlipBook
              ref={mobileBookRef}
              width={330}
              height={450}
              size="stretch"
              minWidth={250}
              maxWidth={370}
              minHeight={341}
              maxHeight={505}
              startPage={0}
              drawShadow
              flippingTime={720}
              usePortrait
              startZIndex={10}
              autoSize
              maxShadowOpacity={0.42}
              showCover
              mobileScrollSupport
              clickEventForward={false}
              useMouseEvents
              swipeDistance={18}
              showPageCorners
              disableFlipByClick={false}
              className="catalogue-mobile-flipbook"
              onFlip={(event) => setMobilePage(event.data + 1)}
            >
              {mobileCataloguePages.map((page, index) => (
                <CatalogueFlipPage page={page} key={`${page.title}-${index}`} />
              ))}
            </HTMLFlipBook>

            <button
              type="button"
              className="catalogue-mobile-book__edge catalogue-mobile-book__edge--right"
              onClick={nextMobilePage}
              disabled={mobilePage >= mobileCataloguePages.length}
              aria-label="Next catalogue page"
            >
              ›
            </button>
          </div>

          <div className="catalogue-mobile-book__footer">
            <span>{mobilePage} / {mobileCataloguePages.length}</span>
            <span>Swipe or drag the page edge</span>
          </div>
        </div>
      </div>
    </section>
  )
}
