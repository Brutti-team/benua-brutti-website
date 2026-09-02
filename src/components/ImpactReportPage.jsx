import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, ArrowUpRight } from 'lucide-react'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

function backHome() {
  window.location.href = '/'
}

export default function ImpactReportPage() {
  return (
    <main className="impact-report-page">
      <header className="impact-report-nav">
        <button className="impact-report-nav__brand" onClick={backHome} aria-label="Back to Benua Brutti home">
          <img src={asset('logo-brutti-white.png')} alt="Benua Brutti" />
        </button>
        <button className="impact-report-nav__back" onClick={backHome}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <section className="impact-report-hero">
        <div className="impact-report-shell impact-report-hero__grid">
          <motion.div
            className="impact-report-hero__copy"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="impact-report-kicker">Impact Report · Benua Brutti</p>
            <h1>Measuring a<br /><em>second life.</em></h1>
            <p className="impact-report-intro">
              A closer look at how recovered pallet wood is transformed into useful furniture, extending material life and reducing waste through practical design.
            </p>
          </motion.div>

          <motion.div
            className="impact-report-book-card"
            initial={{ opacity: 0, y: 30, rotate: 1.5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.12, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="impact-report-book-card__top">
              <BookOpen size={24} />
              <span>Interactive flipbook</span>
            </div>
            <div className="impact-report-book-card__cover">
              <small>BENUA BRUTTI</small>
              <strong>IMPACT<br />REPORT</strong>
              <span>Coming soon</span>
            </div>
            <p>
              The full digital impact report will be presented here as an interactive flipbook once the report is ready.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="impact-report-summary">
        <div className="impact-report-shell">
          <div className="impact-report-summary__head">
            <p className="impact-report-kicker">Impact at a glance</p>
            <h2>What the work has already kept in use.</h2>
          </div>

          <div className="impact-report-metrics">
            <article>
              <strong>57</strong>
              <span>Tonnes of pallet wood</span>
              <b>RESCUED</b>
            </article>
            <article>
              <strong>600</strong>
              <span>Trees being</span>
              <b>SAVED</b>
            </article>
          </div>

          <button className="impact-report-home" onClick={backHome}>
            Return to Benua Brutti <ArrowUpRight size={17} />
          </button>
        </div>
      </section>
    </main>
  )
}
