import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createPortal } from 'react-dom'
import App from './App.jsx'
import Collaborators from './components/Collaborators.jsx'
import JourneyPage from './components/JourneyPage.jsx'
import WhatWeBuild from './components/WhatWeBuild.jsx'
import './styles.css'
import './overrides.css'
import './hero-fix.css'
import './collaborators.css'
import './polish.css'
import './final-tune.css'
import './modern-2026.css'
import './footer-tune.css'
import './hero-landscape.css'
import './hero-ui-refresh.css'
import './impact-saas.css'
import './impact-visual-cards.css'
import './impact-bright.css'
import './impact-luxury.css'
import './hero-luxury.css'
import './logo-premium.css'
import './scroll-replay.css'
import './gallery-premium.css'
import './story-premium.css'
import './story-crop-fix.css'
import './what-we-build.css'
import './what-we-build-two.css'
import './what-we-build-refine.css'
import './what-we-build-heading.css'
import './what-we-build-lightbox.css'
import './what-we-build-spacing.css'
import './journey.css'
import './human-touch.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

function CollaboratorsPortal() {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    const contact = document.getElementById('contact')
    if (!contact?.parentNode) return undefined

    const mount = document.createElement('div')
    mount.id = 'strategic-collaborators'
    contact.parentNode.insertBefore(mount, contact)
    setTarget(mount)

    return () => {
      setTarget(null)
      mount.remove()
    }
  }, [])

  return target ? createPortal(<Collaborators />, target) : null
}

function WhatWeBuildPortal() {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    const about = document.getElementById('about')
    if (!about?.parentNode) return undefined

    const mount = document.createElement('div')
    mount.id = 'what-we-build'
    about.parentNode.insertBefore(mount, about)
    setTarget(mount)

    return () => {
      setTarget(null)
      mount.remove()
    }
  }, [])

  return target ? createPortal(<WhatWeBuild />, target) : null
}

function BruttiSite() {
  const [view, setView] = useState(() => (window.location.hash === '#journey' ? 'journey' : 'home'))

  useEffect(() => {
    const onHashChange = () => {
      setView(window.location.hash === '#journey' ? 'journey' : 'home')
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const applyRealAssets = () => {
      const heroPhoto = document.querySelector('.hero__image')
      if (heroPhoto) {
        heroPhoto.src = asset('brutti team.jpg')
        heroPhoto.alt = 'Benua Brutti team'
      }

      const storyPhoto = document.querySelector('.story__photo-wrap img')
      if (storyPhoto) {
        storyPhoto.src = asset('founder & co founder.JPG')
        storyPhoto.alt = 'Benua Brutti founder and co-founder'
      }

      const sharedShowroom = document.querySelector('.showroom img')
      if (sharedShowroom) {
        sharedShowroom.src = asset('our shared showroom.png')
        sharedShowroom.alt = 'Benua Brutti shared showroom'
      }

      document.querySelectorAll('.brand img, .footer img[alt="Benua Brutti"]').forEach((logo) => {
        logo.src = asset('logo-brutti-white.png')
        logo.classList.add('brutti-logo-img')
      })

      const impactStats = document.querySelectorAll('.impact-stat')

      const palletCard = impactStats[0]
      if (palletCard && !palletCard.querySelector('.impact-stat__visual--pallet')) {
        const palletImage = document.createElement('img')
        palletImage.src = asset('pallet.png')
        palletImage.alt = 'Recovered pallet wood'
        palletImage.className = 'impact-stat__visual impact-stat__visual--pallet'
        palletImage.setAttribute('aria-hidden', 'true')
        palletCard.prepend(palletImage)
      }

      const treeCard = impactStats[1]
      if (treeCard && !treeCard.querySelector('.impact-stat__visual--tree')) {
        const treeImage = document.createElement('img')
        treeImage.src = asset('tree.jpg')
        treeImage.alt = 'Tree representing trees saved through pallet upcycling'
        treeImage.className = 'impact-stat__visual impact-stat__visual--tree'
        treeImage.setAttribute('aria-hidden', 'true')
        treeCard.prepend(treeImage)
      }
    }

    applyRealAssets()
    const observer = new MutationObserver(applyRealAssets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (view !== 'home') return undefined

    const rewriteVisibleCopy = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      const nodes = []

      while (walker.nextNode()) nodes.push(walker.currentNode)

      nodes.forEach((node) => {
        const parent = node.parentElement
        if (!parent || parent.closest('script, style, noscript')) return

        const original = node.nodeValue
        if (!original) return

        let next = original
          .replace('pieces — built in Sabah', 'pieces. Built in Sabah')
          .replace('crew — turning a hobby', 'crew, turning a hobby')
          .replace('backyard — a gift that became', 'backyard. It was a gift that became')
          .replace(/[—–]/g, ',')
          .replace(/([A-Za-z])-([A-Za-z])/g, '$1 $2')
          .replace(/\s-\s/g, ' ')

        if (next !== original) node.nodeValue = next
      })
    }

    rewriteVisibleCopy()
    const observer = new MutationObserver(rewriteVisibleCopy)
    observer.observe(document.body, { childList: true, subtree: true, characterData: true })

    return () => observer.disconnect()
  }, [view])

  useEffect(() => {
    const selectors = [
      '.hero__content > .eyebrow',
      '.hero__content > h1',
      '.hero__intro',
      '.hero__explore',
      '.gallery-card',
      '.story__photo-wrap',
      '.process-step',
      '.product-card',
      '.showroom',
      '.footer__grid > *',
      '.footer__bottom',
      '#strategic-collaborators article',
      '#strategic-collaborators [class*="card"]',
    ].join(', ')

    const observed = new WeakSet()
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-scroll-visible')
          } else {
            entry.target.classList.remove('is-scroll-visible')
          }
        })
      },
      {
        threshold: 0.16,
        rootMargin: '0px 0px -7% 0px',
      },
    )

    const attachScrollReplay = () => {
      document.querySelectorAll(selectors).forEach((element, index) => {
        if (observed.has(element)) return
        observed.add(element)
        element.classList.add('scroll-replay')
        element.style.setProperty('--scroll-delay', `${(index % 4) * 55}ms`)
        intersectionObserver.observe(element)
      })
    }

    attachScrollReplay()
    const mutationObserver = new MutationObserver(attachScrollReplay)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      intersectionObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [])

  if (view === 'journey') {
    return <JourneyPage />
  }

  return (
    <>
      <App />
      <WhatWeBuildPortal />
      <CollaboratorsPortal />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BruttiSite />
  </React.StrictMode>,
)
