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
          className="catalogue-coming__media"
          initial={{ opacity: 0, y: 44, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.16 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
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

          <div className="catalogue-coming__media-top">
            <span>A glimpse of what&apos;s coming</span>
            <span>01 / Preview</span>
          </div>

          <div className="catalogue-coming__media-bottom">
            <div>
              <span className="catalogue-coming__mini">THE BRUTTI COLLECTION</span>
              <strong>Furniture · Custom Work · Spaces · Projects</strong>
            </div>
            <span className="catalogue-coming__pill">COMING SOON</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
