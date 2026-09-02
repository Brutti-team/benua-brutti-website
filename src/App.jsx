import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, MapPin, Menu, Phone, X } from 'lucide-react'
import Counter from './components/Counter.jsx'
import Reveal from './components/Reveal.jsx'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

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

  const navItems = [
    { id: 'home', label: 'home' },
    { id: 'about', label: 'about' },
    { id: 'our-journey', label: 'our journey' },
    { id: 'catalogue', label: 'catalogue' },
    { id: 'impact-report', label: 'impact report', page: '/impact/' },
    { id: 'contact', label: 'contact' },
  ]

  const openNavItem = (item) => {
    if (item.page) {
      window.location.href = item.page
      return
    }
    scrollToId(item.id)
  }

  return (
    <main>
      <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
        <button className="brand" onClick={() => scrollToId('home')} aria-label="Benua Brutti home">
          <img
            className="brutti-logo-img"
            src={asset('logo-brutti-white.png')}
            alt="Benua Brutti"
            decoding="async"
            style={{ width: 92, height: 'auto', display: 'block', borderRadius: 4 }}
          />
        </button>

        <nav className="nav__links" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => openNavItem(item)}>{item.label}</button>
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
              key={item.id}
              onClick={() => { openNavItem(item); setMenuOpen(false) }}
              className="mobile-menu__link"
            >
              <span>0{index + 1}</span>{item.label}
            </button>
          ))}
        </motion.div>
      )}

      <section id="home" className="hero" ref={heroRef}>
        <div className="hero__image-wrap">
          <motion.img
            style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
            src={asset('brutti team.jpg')}
            alt="Benua Brutti team"
            className="hero__image"
            loading="eager"
            decoding="async"
            fetchPriority="high"
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
            We rescue pallet wood and turn it into functional, beautiful pieces. Built in Sabah and made to live longer.
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

      <section id="about" className="vision-mission section-pad">
        <div className="page-shell vm-shell">
          <Reveal className="vm-intro">
            <p className="eyebrow">About Brutti</p>
            <h2>Karya <em>anak bangsa.</em></h2>
            <p className="vm-lead">
              Reka dengan identiti Sabah, dibina dengan tujuan, dan dicipta untuk membawa nama Malaysia lebih jauh.
            </p>
          </Reveal>

          <div className="vm-pillars">
            <Reveal className="vm-card vm-card--vision">
              <span className="vm-card__index">01</span>
              <p className="vm-card__label">Visi</p>
              <h3>Angkat Reka Bangsa,<br />Tawan Dunia.</h3>
              <p>Kami tidak sekadar mencipta. Kami membawa warisan bangsa ke pentas dunia.</p>
            </Reveal>

            <Reveal delay={0.1} className="vm-card vm-card--mission">
              <span className="vm-card__index">02</span>
              <p className="vm-card__label">Misi</p>
              <h3>Cipta yang cantik,<br />Buat yang berguna,<br />Bawa nama Malaysia.</h3>
            </Reveal>
          </div>

          <Reveal className="vm-values" delay={0.08}>
            <div className="vm-values__head">
              <div>
                <span>03</span>
                <p>Nilai</p>
              </div>
              <h3>Prinsip yang kami bawa dalam setiap karya.</h3>
            </div>

            <div className="vm-values__grid">
              <article className="vm-value">
                <span>01</span>
                <h4>Reka dengan Jiwa Raga</h4>
                <p>Setiap ciptaan lahir dari hati yang berapi dan tangan yang tidak kenal penat.</p>
              </article>
              <article className="vm-value">
                <span>02</span>
                <h4>Bangga dengan Asal Usul</h4>
                <p>Kami bawa identiti Sabah dan Malaysia dalam setiap inci rekaan. Asal usul adalah kekuatan.</p>
              </article>
              <article className="vm-value">
                <span>03</span>
                <h4>Jiwa Belajar, Jiwa Merdeka</h4>
                <p>Kami terus mencari, mencuba, dan berkembang. Bebas untuk jadi lebih baik, setiap hari.</p>
              </article>
              <article className="vm-value">
                <span>04</span>
                <h4>Buat untuk Dunia</h4>
                <p>Kualiti global, rasa tempatan. Apa yang lahir di sini, layak dikagumi di mana-mana.</p>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="our-journey" className="story section-pad">
        <div className="page-shell story__grid">
          <div className="story__visual">
            <motion.div
              className="story__photo-wrap"
              initial={{ clipPath: 'inset(100% 0 0 0)' }}
              whileInView={{ clipPath: 'inset(0% 0 0 0)' }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            >
              <img
                src={asset('founders.jpg')}
                alt="Benua Brutti founder and co-founder"
                loading="lazy"
                decoding="async"
                fetchPriority="low"
              />
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
                Instead of stopping, they combined woodworking and metalworking skills to create a new revenue path for their crew, turning a hobby into a growing furniture business.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <blockquote>
                “The first piece was a humble bedside table, crafted in the backyard. It was a gift that became the beginning of something bigger.”
              </blockquote>
            </Reveal>
            <Reveal delay={0.26}>
              <button
                className="story__journey-button"
                onClick={() => {
                  window.location.href = '/journey/'
                }}
              >
                Explore our journey <ArrowUpRight size={17} />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="catalogue" className="catalogue catalogue--anchor-only" aria-hidden="true" />

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
            src={asset('showroom-web.jpg')}
            alt="Benua Brutti shared showroom"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
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
              className="brutti-logo-img"
              src={asset('logo-brutti-white.png')}
              alt="Benua Brutti"
              loading="lazy"
              decoding="async"
              style={{ width: 110, height: 'auto', marginBottom: 12, borderRadius: 4 }}
            />
            <p>Furniture with a second life.</p>
          </div>

          <div className="footer__connect">
            <div className="footer__connect-head">
              <span className="footer__connect-label">Get in touch</span>
              <p>For enquiries, collaborations and careers.</p>
            </div>

            <div className="footer__email-list">
              <a
                className="footer__email-link"
                href="https://mail.google.com/mail/?view=cm&fs=1&to=benuabrutti@gmail.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Compose an email to Benua Brutti in Gmail"
              >
                <span className="footer__email-icon" aria-hidden="true">
                  <img src={asset('gmail.png')} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="footer__email-copy">
                  <small>General enquiries</small>
                  <strong>benuabrutti@gmail.com</strong>
                </span>
                <span className="footer__email-open" aria-hidden="true"><ArrowUpRight size={14} /></span>
              </a>

              <a
                className="footer__email-link"
                href="https://mail.google.com/mail/?view=cm&fs=1&to=hr.bruttibesi@gmail.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Compose an email to Benua Brutti HR in Gmail"
              >
                <span className="footer__email-icon" aria-hidden="true">
                  <img src={asset('gmail.png')} alt="" loading="lazy" decoding="async" />
                </span>
                <span className="footer__email-copy">
                  <small>Careers & HR</small>
                  <strong>hr.bruttibesi@gmail.com</strong>
                </span>
                <span className="footer__email-open" aria-hidden="true"><ArrowUpRight size={14} /></span>
              </a>
            </div>

            <div className="footer__connect-bottom">
              <div className="footer__social" aria-label="Benua Brutti social media">
                <span className="footer__social-label">Follow Brutti</span>
                <div className="footer__social-links">
                  <a data-logo-applied="true" href="https://www.tiktok.com/@brutti.my?_r=1&_t=ZS-99FmWlcm2fQ" target="_blank" rel="noreferrer" aria-label="Benua Brutti on TikTok" title="TikTok">
                    <img className="footer__social-logo" src={asset('tiktok.jpg')} alt="TikTok logo" loading="lazy" decoding="async" />
                  </a>
                  <a data-logo-applied="true" href="https://www.instagram.com/brutti.my?igsi=ZnU3dHVqOXRnZTJk" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Instagram" title="Instagram">
                    <img className="footer__social-logo" src={asset('ig.jpg')} alt="Instagram logo" loading="lazy" decoding="async" />
                  </a>
                  <a data-logo-applied="true" href="https://www.facebook.com/share/1EfVN5HMJm/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Facebook" title="Facebook">
                    <img className="footer__social-logo" src={asset('fb.png')} alt="Facebook logo" loading="lazy" decoding="async" />
                  </a>
                  <a data-logo-applied="true" href="https://www.threads.com/@brutti.my?igshid=NTc4MTIwNjQ2YQ==" target="_blank" rel="noreferrer" aria-label="Benua Brutti on Threads" title="Threads">
                    <img className="footer__social-logo" src={asset('threads.png')} alt="Threads logo" loading="lazy" decoding="async" />
                  </a>
                </div>
              </div>

              <button className="footer__backtop" onClick={() => scrollToId('home')}>
                Back to top <span>↑</span>
              </button>
            </div>
          </div>
        </div>
        <div className="page-shell footer__bottom">© {new Date().getFullYear()} Benua Brutti. Crafted in Sabah.</div>
      </footer>
    </main>
  )
}

export default App