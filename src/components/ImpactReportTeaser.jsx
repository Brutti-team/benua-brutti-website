import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import '../impact-report-teaser.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function ImpactReportTeaser() {
  return (
    <section id="impact-report" className="impact-teaser section-pad" aria-labelledby="impact-teaser-title">
      <div className="impact-teaser__glow impact-teaser__glow--one" aria-hidden="true" />
      <div className="impact-teaser__glow impact-teaser__glow--two" aria-hidden="true" />

      <div className="page-shell impact-teaser__shell">
        <motion.div
          className="impact-teaser__copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="impact-teaser__eyebrow"
            initial={{ opacity: 0, y: 14, letterSpacing: '0.26em' }}
            whileInView={{ opacity: 1, y: 0, letterSpacing: '0.19em' }}
            viewport={{ once: false, amount: 0.8 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Impact Report · 2026
          </motion.p>

          <h2 id="impact-teaser-title" className="impact-teaser__animated-title">
            <motion.span
              className="impact-teaser__title-row"
              initial={{ opacity: 0, y: 34, filter: 'blur(7px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.78, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
            >
              The story behind
            </motion.span>
            <motion.em
              className="impact-teaser__title-row impact-teaser__title-row--accent"
              initial={{ opacity: 0, y: 30, filter: 'blur(7px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.86, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            >
              the impact.
            </motion.em>
          </h2>

          <motion.p
            className="impact-teaser__lead"
            initial={{ opacity: 0, y: 22, filter: 'blur(5px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.65 }}
            transition={{ duration: 0.76, delay: 0.26, ease: [0.22, 1, 0.36, 1] }}
          >
            Explore how Benua Brutti gives recovered pallet wood a second life,
            the work behind the numbers, and the people and ideas shaping our journey.
          </motion.p>

          <motion.div
            className="impact-teaser__meta"
            aria-label="Impact report highlights"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.8 }}
            transition={{ duration: 0.62, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>40-page report</span>
            <span>Interactive book</span>
          </motion.div>

          <motion.a
            className="impact-teaser__button"
            href="/impact/"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: false, amount: 0.8 }}
            transition={{ duration: 0.62, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -2, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
          >
            <BookOpen size={18} aria-hidden="true" />
            <span>Read the Impact Report</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </motion.a>
        </motion.div>

        <motion.a
          className="impact-teaser__book"
          href="/impact/"
          aria-label="Open Brutti Impact Report 2026"
          initial={{ opacity: 0, y: 36, rotate: 1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          whileHover={{ y: -7, rotate: -0.7 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="impact-teaser__book-shadow" aria-hidden="true" />
          <div className="impact-teaser__page impact-teaser__page--back" aria-hidden="true">
            <img
              src={asset('impact-report/page-02.webp')}
              alt=""
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="impact-teaser__page impact-teaser__page--cover">
            <img
              src={asset('impact-report/page-01.webp')}
              alt="Brutti Impact Report 2026 cover"
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="impact-teaser__open-label">
            Open report <ArrowUpRight size={14} aria-hidden="true" />
          </span>
        </motion.a>
      </div>
    </section>
  )
}
