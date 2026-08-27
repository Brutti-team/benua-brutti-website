import { motion } from 'framer-motion'
import { ArrowUpRight, Blocks, Laptop2 } from 'lucide-react'
import bedBunkbed from '../../bed & bunkbed.png'
import builtInCabinet from '../../built in cabinet.png'
import camper from '../../camper.png'
import kiosk from '../../kiosk.png'
import mementoTwo from '../../memento 2.png'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`
const ease = [0.22, 1, 0.36, 1]

const physicalWorks = [
  { title: 'Bed & Bunkbed', image: bedBunkbed, tag: 'Furniture' },
  { title: 'Built-in Cabinet', image: builtInCabinet, tag: 'Furniture' },
  { title: 'Camper Builds', image: camper, tag: 'Custom Build' },
  { title: 'Kiosk', image: kiosk, tag: 'Commercial' },
  { title: 'Mementos', image: mementoTwo, tag: 'Custom Pieces' },
  { title: 'Racks & Shelves', image: asset('racks  & shelves.png'), tag: 'Furniture' },
  { title: 'Rental Pieces', image: asset('rental.png'), tag: 'Rental' },
  { title: 'Signages', image: asset('signatures.png'), tag: 'Brand Display' },
  { title: 'Tables & Counters', image: asset('table & counters.png'), tag: 'Furniture' },
  { title: 'Other Custom Builds', image: asset('others.png'), tag: 'Custom Work' },
]

function BuildCard({ className = '', children, delay = 0 }) {
  return (
    <motion.article
      className={`wwb-card ${className}`}
      initial={{ y: 22, scale: 0.992 }}
      whileInView={{ y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.22 }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.article>
  )
}

function ServiceCard({ item, index }) {
  return (
    <BuildCard className="wwb-service-card" delay={(index % 5) * 0.035}>
      <div className="wwb-service-media">
        <img src={item.image} alt={`Benua Brutti ${item.title}`} />
        <span className="wwb-service-index">{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className="wwb-service-meta">
        <div>
          <small>{item.tag}</small>
          <h3>{item.title}</h3>
        </div>
        <span className="wwb-service-arrow"><ArrowUpRight size={15} /></span>
      </div>
    </BuildCard>
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
            From furniture and signage to commercial builds and digital products, Benua Brutti turns practical ideas into things people can use.
          </p>
        </div>

        <div className="wwb-section-label">
          <span>01</span>
          <strong>Physical &amp; creative works</strong>
          <i />
        </div>

        <div className="wwb-services-grid">
          {physicalWorks.map((item, index) => (
            <ServiceCard key={item.title} item={item} index={index} />
          ))}
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
        </div>

        <div className="wwb-bottom-note">
          <span>One company, multiple ways of building.</span>
          <p>Physical craft and digital problem-solving, developed from the same practical mindset.</p>
        </div>
      </div>
    </section>
  )
}
