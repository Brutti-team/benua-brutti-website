import { motion } from 'framer-motion'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function CatalogueComingSoon() {
  return (
    <section className="catalogue-coming section-pad" aria-labelledby="catalogue-coming-title">
      <div className="page-shell">
        <div className="catalogue-coming__head">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow">Brutti Catalog</p>
            <h2 id="catalogue-coming-title">
              Our catalog is<br /><em>coming soon.</em>
            </h2>
          </motion.div>

          <motion.div
            className="catalogue-coming__copy"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="catalogue-coming__status">COMING SOON</span>
            <p>
              A curated collection of Benua Brutti furniture, custom works and spaces, all in one place.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="catalogue-coming__feature"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="catalogue-coming__media">
            <video
              className="catalogue-coming__video"
              src={asset('vid catalog.MOV')}
              poster={asset('racks.png')}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Preview of Benua Brutti furniture and showroom"
            />
            <div className="catalogue-coming__shade" />
            <div className="catalogue-coming__preview-label">
              <span>Preview</span>
              <span>01</span>
            </div>
          </div>

          <div className="catalogue-coming__meta">
            <div className="catalogue-coming__categories" aria-label="Catalogue categories">
              <span>Furniture</span>
              <i />
              <span>Custom Work</span>
              <i />
              <span>Spaces</span>
              <i />
              <span>Projects</span>
            </div>
            <span className="catalogue-coming__meta-note">Full collection coming soon</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
