import { motion } from 'framer-motion'
import { ArrowUpRight, BriefcaseBusiness, Hammer, GraduationCap } from 'lucide-react'
import '../career.css'

const roles = [
  { label: 'Internship', icon: GraduationCap },
  { label: 'Machinist', icon: BriefcaseBusiness },
  { label: 'Artisan', icon: Hammer },
]

export default function CareerTeaser() {
  return (
    <section id="career" className="career-teaser section-pad" aria-labelledby="career-teaser-title">
      <div className="career-teaser__grain" aria-hidden="true" />

      <div className="page-shell career-teaser__shell">
        <motion.div
          className="career-teaser__copy"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="career-kicker">Careers at Brutti</p>
          <h2 id="career-teaser-title">
            Build things that<br />
            <em>matter with us.</em>
          </h2>
          <p className="career-teaser__lead">
            We are always looking for people who enjoy learning, making and solving
            real problems. Explore opportunities to grow with Benua Brutti.
          </p>

          <a className="career-primary-button" href="/career/">
            <span>Explore Careers</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </motion.div>

        <div className="career-teaser__roles" aria-label="Career opportunities">
          {roles.map(({ label, icon: Icon }, index) => (
            <motion.a
              key={label}
              className="career-role-preview"
              href="/career/"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.45 }}
              transition={{
                duration: 0.62,
                delay: 0.08 + index * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4 }}
            >
              <span className="career-role-preview__icon"><Icon size={20} /></span>
              <span>
                <small>Opportunity 0{index + 1}</small>
                <strong>{label}</strong>
              </span>
              <ArrowUpRight className="career-role-preview__arrow" size={17} />
            </motion.a>
          ))}
          <motion.p
            className="career-teaser__note"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ delay: 0.42, duration: 0.6 }}
          >
            Other workshop, production and general opportunities may also be available.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
