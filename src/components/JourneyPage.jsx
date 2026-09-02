import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: false, amount: 0.18 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
}

function backHome() {
  window.location.href = '/'
}

export default function JourneyPage() {
  return (
    <main className="journey-page">
      <header className="journey-nav">
        <button className="journey-nav__brand" onClick={backHome} aria-label="Back to Benua Brutti home">
          <img src={asset('logo-brutti-white.png')} alt="Benua Brutti" />
        </button>
        <button className="journey-nav__back" onClick={backHome}>
          <ArrowLeft size={16} /> Back to home
        </button>
      </header>

      <section className="journey-hero">
        <motion.div
          className="journey-hero__media"
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
        >
          <img src={asset('our-journey-web.jpg')} alt="Benua Brutti journey" />
          <div className="journey-hero__shade" />
        </motion.div>

        <div className="journey-shell journey-hero__content">
          <motion.p
            className="journey-kicker journey-kicker--light"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.65 }}
          >
            Our journey · Sabah
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            Built one chapter<br />at a time.
          </motion.h1>
          <motion.p
            className="journey-hero__intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.75 }}
          >
            Benua Brutti grew from a simple DIY idea into a furniture journey shaped by resilience, hands-on craft and the belief that useful materials deserve a second life.
          </motion.p>
        </div>
      </section>

      <section className="journey-section journey-section--light">
        <div className="journey-shell journey-origin">
          <motion.div className="journey-origin__copy" {...reveal}>
            <p className="journey-kicker">01 · The beginning</p>
            <h2>From a backyard idea.</h2>
            <p>
              During the disruption of 2020, Lukman and Faznur combined their woodworking and metalworking skills to create a new path for their crew. A humble bedside table made in the backyard became the beginning of something bigger.
            </p>
          </motion.div>

          <motion.figure className="journey-origin__image" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
            <img src={asset('belakang rumah.png')} alt="The early Benua Brutti journey" />
            <figcaption>Where the idea began</figcaption>
          </motion.figure>
        </div>
      </section>

      <section className="journey-section journey-section--green">
        <div className="journey-shell">
          <motion.div className="journey-section__head" {...reveal}>
            <p className="journey-kicker journey-kicker--light">02 · Spaces along the way</p>
            <h2>Every workshop tells part of the story.</h2>
            <p>
              As Benua Brutti evolved, different workshop spaces became part of the journey — places where ideas were tested, pieces were built and the team kept moving forward.
            </p>
          </motion.div>

          <div className="journey-workshops">
            {[
              ['kilang jalan ramayah.png', 'Jalan Ramayah'],
              ['kilang kinarut.png', 'Kinarut'],
              ['kilang kkip.png', 'KKIP'],
            ].map(([image, label], index) => (
              <motion.figure
                className="journey-workshop-card"
                key={label}
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.18 }}
                transition={{ duration: 0.75, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <img src={asset(image)} alt={`Benua Brutti workshop in ${label}`} />
                <figcaption><span>0{index + 1}</span>{label}</figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section className="journey-section journey-section--light">
        <div className="journey-shell journey-purpose">
          <motion.figure className="journey-purpose__image" {...reveal}>
            <img src={asset('karya anak bangsa.png')} alt="Benua Brutti custom work" />
          </motion.figure>

          <motion.div className="journey-purpose__copy" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
            <p className="journey-kicker">03 · Made with purpose</p>
            <h2>Craft that gives materials another life.</h2>
            <p>
              Pallet wood remains central to the way Benua Brutti thinks about making — transforming recovered material into functional pieces designed to be used, kept and appreciated.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="journey-section journey-section--today">
        <div className="journey-shell journey-today">
          <motion.div className="journey-today__copy" {...reveal}>
            <p className="journey-kicker journey-kicker--light">04 · Today</p>
            <h2>The journey is still being built.</h2>
            <p>
              Benua Brutti continues to grow around the same principles that shaped the beginning: resourcefulness, practical design, responsible material use and a team willing to keep learning by doing.
            </p>
            <button className="journey-primary" onClick={backHome}>
              Return to Benua Brutti <ArrowUpRight size={17} />
            </button>
          </motion.div>

          <motion.figure className="journey-today__image" {...reveal} transition={{ ...reveal.transition, delay: 0.08 }}>
            <img src={asset('our shared showroom.png')} alt="Benua Brutti shared showroom" />
          </motion.figure>
        </div>
      </section>
    </main>
  )
}
