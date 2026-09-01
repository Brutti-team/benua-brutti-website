import { motion } from 'framer-motion'
import '../catalogue-coming-clean.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

const categories = ['Furniture', 'Custom Work', 'Spaces', 'Projects']

export default function CatalogueComingSoon() {
  return (
    <section className="catalogue-coming section-pad" aria-labelledby="catalogue-coming-title">
      <div className="catalogue-coming__ambient catalogue-coming__ambient--one" aria-hidden="true" />
      <div className="catalogue-coming__ambient catalogue-coming__ambient--two" aria-hidden="true" />

      <div className="page-shell catalogue-coming__shell">
        <div className="catalogue-coming__intro">
          <motion.p
            className="eyebrow catalogue-coming__eyebrow"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.7 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Brutti Catalog
          </motion.p>

          <motion.h2
            id="catalogue-coming-title"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.82, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Our catalog is{' '}
            <motion.em
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.55 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              coming soon.
            </motion.em>
          </motion.h2>

          <motion.p
            className="catalogue-coming__lead"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.55 }}
            transition={{ duration: 0.7, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            A curated collection of Benua Brutti furniture, custom work, spaces and projects, gathered in one place.
          </motion.p>

          <div className="catalogue-coming__categories" aria-label="Catalogue categories">
            {categories.map((category, index) => (
              <motion.span
                key={category}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ duration: 0.5, delay: 0.26 + index * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                {category}
              </motion.span>
            ))}
          </div>
        </div>

        <motion.div
          className="catalogue-coming__media"
          initial={{ opacity: 0, y: 38, scale: 0.985, clipPath: 'inset(0 0 100% 0 round 20px)' }}
          whileInView={{ opacity: 1, y: 0, scale: 1, clipPath: 'inset(0 0 0% 0 round 20px)' }}
          whileHover={{ y: -3 }}
          viewport={{ once: true, amount: 0.14 }}
          transition={{ duration: 1.05, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
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
          <div className="catalogue-coming__soft-light" aria-hidden="true" />

          <div className="catalogue-coming__media-top">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.62, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              A glimpse of what&apos;s coming
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              Preview 01
            </motion.span>
          </div>

          <div className="catalogue-coming__media-bottom">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.72, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="catalogue-coming__mini">THE BRUTTI COLLECTION</span>
              <strong>Furniture · Custom Work · Spaces · Projects</strong>
            </motion.div>
            <motion.span
              className="catalogue-coming__pill"
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.82, duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            >
              COMING SOON
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
