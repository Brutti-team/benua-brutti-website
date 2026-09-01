import { motion } from 'framer-motion'
import '../catalogue-coming-clean.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

export default function CatalogueComingSoon() {
  return (
    <section className="catalogue-coming section-pad" aria-labelledby="catalogue-coming-title">
      <div className="catalogue-coming__ambient catalogue-coming__ambient--one" aria-hidden="true" />
      <div className="catalogue-coming__ambient catalogue-coming__ambient--two" aria-hidden="true" />

      <div className="page-shell catalogue-coming__shell">
        <div className="catalogue-coming__head">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow catalogue-coming__eyebrow">Brutti Catalog</p>
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
            <div className="catalogue-coming__copy-foot" aria-hidden="true">
              <span>Furniture</span>
              <span>Custom</span>
              <span>Spaces</span>
              <span>Projects</span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="catalogue-coming__media"
          initial={{ opacity: 0, y: 44, scale: 0.985 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ y: -3 }}
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
          <motion.div
            className="catalogue-coming__scan"
            aria-hidden="true"
            animate={{ x: ['-120%', '230%'] }}
            transition={{ duration: 5.6, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.8 }}
          />

          <div className="catalogue-coming__media-top">
            <motion.span
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              A glimpse of what&apos;s coming
            </motion.span>
            <motion.span
              initial={{ opacity: 0, x: 14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              Preview 01
            </motion.span>
          </div>

          <div className="catalogue-coming__media-bottom">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.48, duration: 0.7 }}
            >
              <span className="catalogue-coming__mini">THE BRUTTI COLLECTION</span>
              <strong>Furniture · Custom Work · Spaces · Projects</strong>
            </motion.div>
            <motion.span
              className="catalogue-coming__pill"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 0 7px rgba(255,255,255,0.05)', '0 0 0 0 rgba(255,255,255,0)'] }}
              viewport={{ once: true }}
              transition={{ opacity: { delay: 0.58, duration: 0.5 }, scale: { delay: 0.58, duration: 0.5 }, boxShadow: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } }}
            >
              COMING SOON
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
