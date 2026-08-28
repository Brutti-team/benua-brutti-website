import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, MapPin, Menu, Phone, X } from 'lucide-react'
import Counter from './components/Counter.jsx'
import Reveal from './components/Reveal.jsx'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const catalogue = [
  { image: asset('racks.png'), title: 'Racks & Shelves', category: 'Furniture' },
  { image: asset('karya anak bangsa.png'), title: 'Karya Anak Bangsa', category: 'Custom Work' },
  { image: asset('kilang kinarut.png'), title: 'Kinarut Workshop', category: 'Our Journey' },
  { image: asset('kilang kkip.png'), title: 'KKIP Workshop', category: 'Our Journey' },
]

function scrollToId(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.35])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navItems = ['home', 'about', 'catalogue', 'contact']

  return (
    <main>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <button className="brand" onClick={() => scrollToId('home')} aria-label="Benua Brutti home">
          <img
            src={asset('logo brutti.jpg')}
            alt="Benua Brutti"
            style={{ width: 92, height: 'auto', display: 'block', borderRadius: 4 }}
          />
        </button>

        <nav className="nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item} onClick={() => scrollToId(item)}>{item}</button>
          ))}
        </nav>

        <button className="nav__menu" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </header>

      {menuOpen && (
        <motion.div
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <button className="mobile-menu__close" onClick={() => setMenuOpen(false)}><X /></button>
          {navItems.map((item, index) => (
            <button
              key={item}
              onClick={() => { scrollToId(item); setMenuOpen(false) }}
              className="mobile-menu__link"
            >
              <span>0{index + 1}</span>{item}
            </button>
          ))}
        </motion.div>
      )}

      <section id="home" className="hero" ref={heroRef}>
        <div className="hero__image-wrap">
          <motion.img
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
            src={asset('belakang rumah.png')}
            alt="The early Benua Brutti journey"
            className="hero__image"
          />
          <div className="hero__shade" />
        </div>

        <div className="hero__content page-shell">
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="eyebrow eyebrow--light"
          >
            Upcycled furniture · Sabah
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            Furniture with<br />a <em>second life.</em>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8 }}
            className="hero__intro"
          >
            We rescue pallet wood and turn it into functional, beautiful pieces — built in Sabah and made to live longer.
          </motion.p>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.7 }}
            className="hero__explore"
            onClick={() => scrollToId('impact')}
          >
            Explore our story <ArrowDown size={18} />
          </motion.button>
        </div>
      </section>

      <section id="impact" className="impact section-pad">
        <div className="page-shell impact__grid">
          <Reveal>
            <p className="eyebrow">Our impact</p>
            <h2>Waste becomes<br /><em>worth.</em></h2>
          </Reveal>
          <Reveal delay={0.15} className="impact__copy">
            <p>
              By upcycling pallet wood, Benua Brutti creates useful furniture while extending the life of materials that might otherwise go to waste.
            </p>
          </Reveal>
        </div>

        <div className="page-shell impact__numbers">
          <Reveal className="impact-stat">
            <strong><Counter end={57} /></strong>
            <span>Tonnes of pallet wood</span>
            <b>RESCUED</b>
          </Reveal>
          <div className="impact__line" />
          <Reveal delay={0.1} className="impact-stat">
            <strong><Counter end={600} /></strong>
            <span>Trees being</span>
            <b>SAVED</b>
          </Reveal>
        </div>
      </section>

      <section className="gallery section-pad--bottom">
        <div className="page-shell">
          <Reveal className="gallery__lead">
            <p className="eyebrow">Made by Brutti</p>
            <h2>Built with purpose.<br /><em>Made to be used.</em></h2>
          </Reveal>

          <div className="gallery__layout">
            <motion.figure
              className="gallery-card gallery-card--large"
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={asset('racks.png')} alt="Benua Brutti racks and shelving" />
              <figcaption>Furniture · Racks & shelves</figcaption>
            </motion.figure>

            <div className="gallery__stack">
              <motion.figure
                className="gallery-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.12 }}
              >
                <img src={asset('karya anak bangsa.png')} alt="Benua Brutti custom work" />
                <figcaption>Custom work · Sabah</figcaption>
              </motion.figure>
              <motion.figure
                className="gallery-card gallery-card--wide"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.9, delay: 0.2 }}
              >
                <img src={asset('kilang jalan ramayah.png')} alt="Benua Brutti workshop journey" />
                <figcaption>Our journey · Workshop</figcaption>
              </motion.figure>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="story section-pad">
        <div className="page-shell story__grid">
          <div className="story__visual">
            <motion.div
              className="story__photo-wrap"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={asset('founder & co founder.JPG')} alt="Benua Brutti founders Lukman and Faznur" />
            </motion.div>
            <span className="story__vertical">OUR STORY</span>
          </div>

          <div className="story__content">
            <Reveal>
              <p className="eyebrow eyebrow--light">From a backyard idea</p>
              <h2>Built through<br /><em>resilience.</em></h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p>
                Lukman and Faznur were already living their DIY dreams when the 2020 pandemic disrupted businesses and livelihoods.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <p>
                Instead of stopping, they combined woodworking and metalworking skills to create a new revenue path for their crew — turning a hobby into a growing furniture business.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <blockquote>
                “The first piece was a humble bedside table, crafted in the backyard — a gift that became the beginning of something bigger.”
              </blockquote>
            </Reveal>
            <Reveal delay={0.26}>
              <button
                className="story__journey-button"
                onClick={() => {
                  window.location.hash = 'journey'
                  window.scrollTo({ top: 0, behavior: 'auto' })
                }}
              >
                Explore our journey <ArrowUpRight size={17} />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="catalogue" className="catalogue section-pad">
        <div className="page-shell">
          <div className="catalogue__heading">
            <Reveal>
              <p className="eyebrow">Selected Brutti</p>
              <h2>Work, spaces<br /><em>& our journey.</em></h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="catalogue__intro">A first look using the real Benua Brutti images currently uploaded to the website repository.</p>
            </Reveal>
          </div>

          <div className="catalogue__grid">
            {catalogue.map((item, index) => (
              <motion.article
                className="product-card"
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.8, delay: (index % 2) * 0.1 }}
              >
                <div className="product-card__image">
                  <img src={item.image} alt={item.title} />
                  <div className="product-card__hover"><ArrowUpRight /></div>
                </div>
                <div className="product-card__meta">
                  <span>{item.category}</span>
                  <h3>{item.title}</h3>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact section-pad">
        <div className="page-shell contact__head">
          <Reveal>
            <p className="eyebrow eyebrow--light">Come visit us</p>
            <h2>Let’s make something<br /><em>worth keeping.</em></h2>
          </Reveal>
          <Reveal delay={0.12}>
            <a className="contact__phone" href="tel:+601136043432"><Phone size={19} /> +60 11-3604 3432</a>
          </Reveal>
        </div>

        <div className="page-shell contact__grid">
          <Reveal className="location-card">
            <span>01 · Workshop</span>
            <h3>Benua Brutti</h3>
            <p>Kilang 5,<br />Taman Industri Perabot<br />Kota Kinabalu Industrial Park (KKIP),<br />88450 Kota Kinabalu, Sabah.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=Kilang+5+Taman+Industri+Perabot+KKIP+Kota+Kinabalu+Sabah" target="_blank" rel="noreferrer">
              Get directions <ArrowUpRight size={17} />
            </a>
          </Reveal>

          <Reveal delay={0.1} className="location-card">
            <span>02 · Shared showroom</span>
            <h3>The Art Attic</h3>
            <p>7, Lorong Dewan,<br />Pusat Bandar Kota Kinabalu,<br />88000 Kota Kinabalu, Sabah.</p>
            <a href="https://www.google.com/maps/search/?api=1&query=The+Art+Attic+7+Lorong+Dewan+Kota+Kinabalu+Sabah" target="_blank" rel="noreferrer">
              Get directions <ArrowUpRight size={17} />
            </a>
          </Reveal>
        </div>

        <div className="page-shell showroom">
          <motion.img
            src={asset('showroom.png')}
            alt="Benua Brutti shared showroom"
            initial={{ scale: 1.07, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.1 }}
          />
          <div className="showroom__label"><MapPin size={18} /> OUR SHARED SHOWROOM</div>
        </div>
      </section>

      <footer className="footer">
        <div className="page-shell footer__grid">
          <div className="footer__brand">
            <img
              src={asset('logo brutti.jpg')}
              alt="Benua Brutti"
              style={{ width: 110, height: 'auto', marginBottom: 12, borderRadius: 4 }}
            />
            <p>Furniture with a second life.</p>

            <div className="footer__social" aria-label="Benua Brutti social media">
              <span className="footer__social-label">Follow Brutti</span>
              <div className="footer__social-links">
                <a href="https://www.tiktok.com/@brutti.my?_r=1&_t=ZS-99FmWlcm2fQ" target="_blank" rel="noreferrer" aria-label="Benua Brutti on TikTok">
                  TikTok <ArrowUpRight size={12} />
                </a>
                <a href="https://www.instagram.com/brutti.my?igsi=ZnU3dHVqOXRnZTJk" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Instagram">
                  Instagram <ArrowUpRight size={12} />
                </a>
                <a href="https://www.facebook.com/share/1EfVN5HMJm/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Facebook">
                  Facebook <ArrowUpRight size={12} />
                </a>
                <a href="https://www.threads.com/@brutti.my?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Threads">
                  Threads <ArrowUpRight size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="footer__links">
            <a href="mailto:benuabrutti@gmail.com">benuabrutti@gmail.com</a>
            <span>@brutti.my</span>
            <button onClick={() => scrollToId('home')}>Back to top ↑</button>
          </div>
        </div>
        <div className="page-shell footer__bottom">© {new Date().getFullYear()} Benua Brutti. Crafted in Sabah.</div>
      </footer>
    </main>
  )
}

export default App