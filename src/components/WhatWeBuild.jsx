import { motion } from 'framer-motion'
import { ArrowUpRight, Blocks, Hammer, Laptop2, Shapes } from 'lucide-react'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const ease = [0.22, 1, 0.36, 1]

function BuildCard({ className = '', children, delay = 0 }) {
  return (
    <motion.article
      className={`wwb-card ${className}`}
      initial={{ y: 24, scale: 0.99 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.24 }}
      transition={{ duration: 0.72, delay, ease }}
    >
      {children}
    </motion.article>
  )
}

export default function WhatWeBuild() {
  return (
    <section className="what-we-build" aria-labelledby="what-we-build-title">
      <div className="page-shell wwb-shell">
        <div className="wwb-heading">
          <div>
            <p className="wwb-eyebrow"><span /> What we build</p>
            <h2 id="what-we-build-title">Built beyond <em>furniture.</em></h2>
          </div>
          <p className="wwb-intro">
            Benua Brutti creates physical work for real spaces and develops digital products that solve practical problems.
          </p>
        </div>

        <div className="wwb-section-label">
          <span>01</span>
          <strong>Physical &amp; creative works</strong>
          <i />
        </div>

        <div className="wwb-physical-grid">
          <BuildCard className="wwb-card--furniture">
            <img src={asset('racks.png')} alt="Benua Brutti furniture and custom build" />
            <div className="wwb-card-shade" />
            <div className="wwb-card-topline">
              <span className="wwb-icon"><Hammer size={16} /></span>
              <span>Furniture &amp; Custom Builds</span>
            </div>
            <div className="wwb-card-copy wwb-card-copy--light">
              <p>Made for everyday use</p>
              <h3>Furniture built with function, character and a second life.</h3>
              <span className="wwb-card-link">Physical works <ArrowUpRight size={15} /></span>
            </div>
          </BuildCard>

          <BuildCard className="wwb-card--signage" delay={0.06}>
            <img src={asset('karya anak bangsa.png')} alt="Benua Brutti signage and branded display work" />
            <div className="wwb-card-shade" />
            <div className="wwb-card-topline">
              <span className="wwb-icon"><Shapes size={16} /></span>
              <span>Signage &amp; Brand Displays</span>
            </div>
            <div className="wwb-card-copy wwb-card-copy--light">
              <p>Built for brands &amp; spaces</p>
              <h3>Custom pieces that turn identity into something physical.</h3>
              <span className="wwb-card-link">Creative works <ArrowUpRight size={15} /></span>
            </div>
          </BuildCard>
        </div>

        <div className="wwb-section-label wwb-section-label--digital">
          <span>02</span>
          <strong>Digital products</strong>
          <i />
        </div>

        <div className="wwb-digital-grid">
          <BuildCard className="wwb-card--digital wwb-card--tumbooh" delay={0.04}>
            <div className="wwb-product-head">
              <span className="wwb-product-icon"><Laptop2 size={18} /></span>
              <span>Grant management</span>
            </div>
            <div className="wwb-product-wordmark">TUMBOOH</div>
            <p className="wwb-product-desc">A grant management system designed to make applications, reviews and reporting easier to manage.</p>
            <div className="wwb-mini-ui" aria-hidden="true">
              <span className="wwb-mini-ui__bar" />
              <div><i /><i /><i /></div>
              <b /><b />
            </div>
            <div className="wwb-product-foot"><span>Digital product</span><ArrowUpRight size={16} /></div>
          </BuildCard>

          <BuildCard className="wwb-card--digital wwb-card--selesai" delay={0.08}>
            <div className="wwb-product-head">
              <span className="wwb-product-icon"><Blocks size={18} /></span>
              <span>Home services</span>
            </div>
            <div className="wwb-product-wordmark">SelesAI</div>
            <p className="wwb-product-desc">A platform concept connecting homeowners with trusted repair and maintenance support.</p>
            <div className="wwb-orbit" aria-hidden="true"><i /><i /><i /></div>
            <div className="wwb-product-foot"><span>Digital product</span><ArrowUpRight size={16} /></div>
          </BuildCard>

          <BuildCard className="wwb-card--digital wwb-card--os" delay={0.12}>
            <div className="wwb-product-head">
              <span className="wwb-product-icon"><Blocks size={18} /></span>
              <span>Operations</span>
            </div>
            <div className="wwb-product-wordmark">BRUTTI OS</div>
            <p className="wwb-product-desc">An internal operating system for tasks, attendance, leave, projects and day-to-day team operations.</p>
            <div className="wwb-os-grid" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
            <div className="wwb-product-foot"><span>Internal system</span><ArrowUpRight size={16} /></div>
          </BuildCard>
        </div>

        <div className="wwb-bottom-note">
          <span>One company, multiple ways of building.</span>
          <p>Physical craft and digital problem-solving, developed from the same practical mindset.</p>
        </div>
      </div>
    </section>
  )
}
