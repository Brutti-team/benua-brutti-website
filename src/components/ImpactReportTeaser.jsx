import { motion } from 'framer-motion'
import { ArrowUpRight, BookOpen } from 'lucide-react'
import '../impact-report-teaser.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function ImpactReportTeaser() {
  return (
    <section className="impact-teaser section-pad" aria-labelledby="impact-teaser-title">
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
          <p className="impact-teaser__eyebrow">Impact Report · 2026</p>
          <h2 id="impact-teaser-title">
            The story behind<br />
            <em>the impact.</em>
          </h2>
          <p className="impact-teaser__lead">
            Explore how Benua Brutti gives recovered pallet wood a second life,
            the work behind the numbers, and the people and ideas shaping our journey.
          </p>

          <div className="impact-teaser__meta" aria-label="Impact report highlights">
            <span>40-page report</span>
            <span>Interactive book</span>
          </div>

          <a className="impact-teaser__button" href="/impact/">
            <BookOpen size={18} aria-hidden="true" />
            <span>Read the Impact Report</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
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
