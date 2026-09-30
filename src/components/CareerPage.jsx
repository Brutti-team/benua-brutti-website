import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, GraduationCap, Hammer, Mail, Wrench } from 'lucide-react'
import '../career.css'

const roles = [
  {
    title: 'Internship Programme',
    tag: 'Students & fresh talent',
    icon: GraduationCap,
    description: 'Learn through real projects across our workshop, operations, creative work and digital initiatives.',
  },
  {
    title: 'Machinist',
    tag: 'Workshop',
    icon: Wrench,
    description: 'Support precise workshop production and machine-based fabrication as part of our hands-on build team.',
  },
  {
    title: 'Artisan',
    tag: 'Craft & making',
    icon: Hammer,
    description: 'Work with materials, tools and practical design to turn ideas into useful, well-made pieces.',
  },
  {
    title: 'General Application',
    tag: 'Other opportunities',
    icon: BriefcaseBusiness,
    description: 'Do not see your role listed? Send us your profile for future workshop, production, operations or creative opportunities.',
  },
]

function backHome() {
  window.location.href = '/'
}

export default function CareerPage() {
  const applyHref = 'mailto:hr.bruttibesi@gmail.com?subject=Career%20Application%20-%20Benua%20Brutti'

  return (
    <main className="career-page">
      <header className="career-page__nav">
        <button className="career-page__brand" onClick={backHome} aria-label="Back to Benua Brutti home">
          <span>BRUTTI™</span>
        </button>
        <button className="career-page__back" onClick={backHome}>
          <ArrowLeft size={17} /> Back to home
        </button>
      </header>

      <section className="career-page__hero">
        <div className="career-page__hero-inner">
          <p className="career-kicker">Join the team · Sabah</p>
          <h1>
            Make, learn and<br />
            <em>grow with Brutti.</em>
          </h1>
          <p>
            We build furniture, spaces, practical solutions and new ideas from Sabah.
            If you enjoy hands-on work, learning fast and building with purpose, there may be a place for you here.
          </p>
          <a className="career-primary-button" href={applyHref}>
            <Mail size={17} />
            <span>Send Your Application</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      <section className="career-page__openings">
        <div className="career-page__section-head">
          <div>
            <p className="career-kicker">Current opportunities</p>
            <h2>Find where you<br /><em>could fit.</em></h2>
          </div>
          <p>
            Role availability can change as projects and production needs evolve.
            Send your CV or portfolio to our HR team for the latest details.
          </p>
        </div>

        <div className="career-page__grid">
          {roles.map(({ title, tag, icon: Icon, description }, index) => (
            <article className="career-opening-card" key={title}>
              <div className="career-opening-card__top">
                <span className="career-opening-card__number">0{index + 1}</span>
                <span className="career-opening-card__icon"><Icon size={21} /></span>
              </div>
              <small>{tag}</small>
              <h3>{title}</h3>
              <p>{description}</p>
              <a href={applyHref}>
                Apply / enquire <ArrowUpRight size={14} />
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="career-page__apply">
        <div>
          <p className="career-kicker">Interested?</p>
          <h2>Tell us what<br /><em>you can bring.</em></h2>
        </div>
        <div className="career-page__apply-copy">
          <p>
            Email your CV, portfolio or a short introduction to our HR team.
            Mention the role you are interested in so we can review your application more easily.
          </p>
          <a className="career-primary-button career-primary-button--light" href={applyHref}>
            <Mail size={17} />
            <span>hr.bruttibesi@gmail.com</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      <footer className="career-page__footer">
        <span>© Benua Brutti Sdn Bhd · Crafted in Sabah.</span>
        <button onClick={backHome}>Back to Brutti ↑</button>
      </footer>
    </main>
  )
}
