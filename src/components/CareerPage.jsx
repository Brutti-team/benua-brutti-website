import { ArrowLeft, ArrowUpRight, BriefcaseBusiness, GraduationCap, Hammer, Mail, Wrench, Users, Sparkles, Leaf, Trophy } from 'lucide-react'
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

const culture = [
  {
    title: 'Learn by making',
    description: 'You will learn through real work, real materials and real project challenges, not just observation.',
    icon: Sparkles,
  },
  {
    title: 'Build together',
    description: 'Workshop, operations, creative and digital work move as one team. Good ideas can come from anyone.',
    icon: Users,
  },
  {
    title: 'Respect the craft',
    description: 'We care about details, materials, useful design and creating work that can last.',
    icon: Hammer,
  },
]

const achievements = [
  { value: '57+', label: 'tonnes of pallet wood rescued' },
  { value: '600+', label: 'trees being saved' },
  { value: 'Sabah', label: 'built locally, made with purpose' },
]

function backHome() {
  window.location.href = '/'
}

export default function CareerPage() {
  const applyHref = 'mailto:hr@brutti.my?subject=Career%20Application%20-%20Benua%20Brutti'

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

      <nav className="career-page__section-nav" aria-label="Career page sections">
        <a href="#why-us">Why with us</a>
        <a href="#culture">Culture</a>
        <a href="#achievement">Achievement</a>
        <a href="#internship">Internship</a>
        <a href="#openings">Open positions</a>
        <a href="#apply">Email</a>
      </nav>

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

      <section id="why-us" className="career-page__why">
        <div className="career-page__why-heading">
          <p className="career-kicker">Why with us</p>
          <h2>Do work that<br /><em>becomes real.</em></h2>
        </div>
        <div className="career-page__why-copy">
          <p className="career-page__why-lead">
            Brutti is a hands-on environment where ideas move from sketches and conversations into real furniture, spaces, systems and solutions.
          </p>
          <div className="career-page__why-points">
            <span>01 · Learn through real projects</span>
            <span>02 · Work across different disciplines</span>
            <span>03 · Build useful things with visible impact</span>
          </div>
        </div>
      </section>

      <section id="culture" className="career-page__culture">
        <div className="career-page__section-title">
          <p className="career-kicker">Culture</p>
          <h2>How we<br /><em>work together.</em></h2>
        </div>
        <div className="career-page__culture-grid">
          {culture.map(({ title, description, icon: Icon }, index) => (
            <article className="career-culture-card" key={title}>
              <div className="career-culture-card__top">
                <span>0{index + 1}</span>
                <Icon size={20} />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="achievement" className="career-page__achievement">
        <div className="career-page__achievement-head">
          <div>
            <p className="career-kicker">Achievement</p>
            <h2>Small steps.<br /><em>Real impact.</em></h2>
          </div>
          <p>
            Our work is rooted in extending the life of materials and turning what could become waste into something useful again.
          </p>
        </div>
        <div className="career-page__achievement-grid">
          {achievements.map((item, index) => (
            <article className="career-achievement-card" key={item.label}>
              <span>0{index + 1}</span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="internship" className="career-page__internship">
        <div className="career-page__internship-icon">
          <GraduationCap size={26} />
        </div>
        <div className="career-page__internship-copy">
          <p className="career-kicker">Internship programme</p>
          <h2>Start by<br /><em>building with us.</em></h2>
          <p>
            Our internship programme is for students who want practical exposure beyond a classroom setting. Depending on current projects, interns may support workshop operations, content and creative work, business operations or digital initiatives.
          </p>
          <div className="career-page__internship-tags">
            <span>Hands-on learning</span>
            <span>Real project exposure</span>
            <span>Multi-disciplinary team</span>
          </div>
          <a className="career-primary-button" href={applyHref}>
            <Mail size={17} />
            <span>Apply for internship</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </section>

      <section id="openings" className="career-page__openings">
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

      <section id="apply" className="career-page__apply">
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
            <span>hr@brutti.my</span>
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
