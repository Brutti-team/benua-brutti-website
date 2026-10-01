import { motion } from 'framer-motion'
import { ArrowUpRight, BriefcaseBusiness, Hammer, GraduationCap, MapPin } from 'lucide-react'
import '../career.css'

const roles = [
  {
    label: 'Internship',
    eyebrow: 'Learn by making',
    meta: 'Students & fresh talent',
    icon: GraduationCap,
  },
  {
    label: 'Machinist',
    eyebrow: 'Workshop craft',
    meta: 'Production & precision',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Artisan',
    eyebrow: 'Craft with character',
    meta: 'Hands-on making',
    icon: Hammer,
  },
]

export default function CareerTeaser() {
  return (
    <section id="career" className="career-teaser section-pad" aria-labelledby="career-teaser-title">
      <div className="career-teaser__ambient" aria-hidden="true" />

      <div className="page-shell career-teaser__shell">
        <motion.div
          className="career-teaser__copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.28 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="career-teaser__meta">
            <span className="career-teaser__eyebrow">
              <span aria-hidden="true" />
              Careers at Brutti
            </span>
            <span className="career-teaser__location">
              <MapPin size={13} aria-hidden="true" />
              Kota Kinabalu, Sabah
            </span>
          </div>

          <h2 id="career-teaser-title">
            Build things that
            <br />
            <em>matter with us.</em>
          </h2>

          <p className="career-teaser__lead">
            Join a team that learns by doing, solves real problems and turns ideas
            into work built to last.
          </p>

          <div className="career-teaser__actions">
            <a className="career-primary-button career-primary-button--teaser" href="/career/">
              <span>Explore careers</span>
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <span className="career-teaser__microcopy">Built in Sabah · Made with purpose</span>
          </div>
        </motion.div>

        <motion.div
          className="career-teaser__panel"
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.22 }}
          transition={{ duration: 0.72, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="career-teaser__panel-head">
            <div>
              <span>Open paths</span>
              <h3>Find where you fit.</h3>
            </div>
            <span className="career-teaser__panel-count">03</span>
          </div>

          <div className="career-teaser__roles" aria-label="Career opportunities">
            {roles.map(({ label, eyebrow, meta, icon: Icon }, index) => (
              <motion.a
                key={label}
                className="career-role-preview"
                href="/career/"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{
                  duration: 0.52,
                  delay: 0.12 + index * 0.07,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 3 }}
              >
                <span className="career-role-preview__icon"><Icon size={19} /></span>
                <span className="career-role-preview__copy">
                  <small>{eyebrow}</small>
                  <strong>{label}</strong>
                  <span>{meta}</span>
                </span>
                <span className="career-role-preview__arrow-wrap" aria-hidden="true">
                  <ArrowUpRight size={16} />
                </span>
              </motion.a>
            ))}
          </div>

          <a className="career-teaser__view-all" href="/career/">
            View all opportunities
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
