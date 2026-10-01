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
    eyebrow: 'Precision in every cut',
    meta: 'Workshop & production',
    icon: BriefcaseBusiness,
  },
  {
    label: 'Artisan',
    eyebrow: 'Craft with character',
    meta: 'Hands-on making',
    icon: Hammer,
  },
]

const principles = [
  ['01', 'Learn', 'Grow with the team'],
  ['02', 'Make', 'Turn ideas into form'],
  ['03', 'Build', 'Create work that lasts'],
]

export default function CareerTeaser() {
  return (
    <section id="career" className="career-teaser section-pad" aria-labelledby="career-teaser-title">
      <div className="career-teaser__grain" aria-hidden="true" />
      <div className="career-teaser__glow" aria-hidden="true" />
      <div className="career-teaser__gridlines" aria-hidden="true" />

      <div className="page-shell career-teaser__shell">
        <motion.div
          className="career-teaser__copy"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.28 }}
          transition={{ duration: 0.76, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="career-teaser__kicker-row">
            <p className="career-kicker">
              <span className="career-kicker__dot" aria-hidden="true" />
              Careers at Brutti
            </p>
            <span className="career-teaser__location">
              <MapPin size={13} aria-hidden="true" />
              Kota Kinabalu, Sabah
            </span>
          </div>

          <h2 id="career-teaser-title">
            Build things that<br />
            <em>matter with us.</em>
          </h2>

          <p className="career-teaser__lead">
            We are always looking for curious people who enjoy learning, making and
            solving real problems. Bring your hands, ideas and energy to Benua Brutti.
          </p>

          <div className="career-teaser__actions">
            <a className="career-primary-button career-primary-button--teaser" href="/career/">
              <span>Explore Careers</span>
              <span className="career-primary-button__icon" aria-hidden="true">
                <ArrowUpRight size={16} />
              </span>
            </a>
            <p>Workshop-led · Hands-on · Built in Sabah</p>
          </div>

          <div className="career-teaser__principles" aria-label="What working at Brutti is about">
            {principles.map(([number, title, description]) => (
              <div className="career-teaser__principle" key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <small>{description}</small>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="career-teaser__panel"
          initial={{ opacity: 0, y: 34, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.78, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="career-teaser__panel-head">
            <div>
              <span>Career paths</span>
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
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{
                  duration: 0.58,
                  delay: 0.12 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ x: 4 }}
              >
                <span className="career-role-preview__number">0{index + 1}</span>
                <span className="career-role-preview__icon"><Icon size={20} /></span>
                <span className="career-role-preview__copy">
                  <small>{eyebrow}</small>
                  <strong>{label}</strong>
                  <span>{meta}</span>
                </span>
                <span className="career-role-preview__arrow-wrap" aria-hidden="true">
                  <ArrowUpRight className="career-role-preview__arrow" size={17} />
                </span>
              </motion.a>
            ))}
          </div>

          <div className="career-teaser__panel-foot">
            <div>
              <span className="career-teaser__status-dot" aria-hidden="true" />
              <p>Other workshop and production opportunities may also be available.</p>
            </div>
            <a href="/career/">
              View all <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
