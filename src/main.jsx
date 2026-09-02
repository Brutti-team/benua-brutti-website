import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createPortal } from 'react-dom'
import App from './App.jsx'
import Collaborators from './components/Collaborators.jsx'
import JourneyPage from './components/JourneyPage.jsx'
import ImpactReportPage from './components/ImpactReportPage.jsx'
import WhatWeBuild from './components/WhatWeBuild.jsx'
import CatalogueComingSoon from './components/CatalogueComingSoon.jsx'
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
import './impact-report.css'
import './human-touch.css'
import './footer-social-fix.css'
import './catalogue-coming-soon.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

function getViewFromLocation() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/journey') return 'journey'
  if (path === '/impact') return 'impact-report'
  if (window.location.hash === '#journey') return 'journey'
  return 'home'
}

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

function CatalogueComingSoonPortal() {
  const [target, setTarget] = useState(null)

  useEffect(() => {
    const catalogue = document.getElementById('catalogue')
    if (!catalogue?.parentNode) return undefined

    const mount = document.createElement('div')
    mount.id = 'catalogue-coming-soon'
    catalogue.parentNode.insertBefore(mount, catalogue.nextSibling)
    catalogue.classList.add('catalogue--anchor-only')
    setTarget(mount)

    return () => {
      setTarget(null)
      catalogue.classList.remove('catalogue--anchor-only')
      mount.remove()
    }
  }, [])

  return target ? createPortal(<CatalogueComingSoon />, target) : null
}

function BruttiSite() {
  const [view, setView] = useState(getViewFromLocation)

  useEffect(() => {
    if (window.location.hash === '#journey') {
      window.history.replaceState({}, '', '/journey/')
      setView('journey')
    }

    const onLocationChange = () => {
      setView(getViewFromLocation())
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('popstate', onLocationChange)
    window.addEventListener('hashchange', onLocationChange)
    return () => {
      window.removeEventListener('popstate', onLocationChange)
      window.removeEventListener('hashchange', onLocationChange)
    }
  }, [])

  useEffect(() => {
    const applyRealAssets = () => {
      const heroPhoto = document.querySelector('.hero__image')
      if (heroPhoto) {
        heroPhoto.src = asset('brutti team.jpg')
        heroPhoto.alt = 'Benua Brutti team'
        heroPhoto.loading = 'eager'
        heroPhoto.decoding = 'async'
        heroPhoto.fetchPriority = 'high'
      }

      const storyPhoto = document.querySelector('.story__photo-wrap img')
      if (storyPhoto) {
        storyPhoto.src = asset('founders.jpg')
        storyPhoto.alt = 'Benua Brutti founder and co-founder'
        storyPhoto.loading = 'lazy'
        storyPhoto.decoding = 'async'
        storyPhoto.fetchPriority = 'low'
      }

      const sharedShowroom = document.querySelector('.showroom img')
      if (sharedShowroom) {
        sharedShowroom.src = asset('showroom-web.jpg')
        sharedShowroom.alt = 'Benua Brutti shared showroom'
        sharedShowroom.loading = 'lazy'
        sharedShowroom.decoding = 'async'
        sharedShowroom.fetchPriority = 'low'
      }

      document.querySelectorAll('.brand img, .footer img[alt="Benua Brutti"]').forEach((logo) => {
        logo.src = asset('logo-brutti-white.png')
        logo.classList.add('brutti-logo-img')
      })

      const socialLogos = [
        { file: 'tiktok.jpg', label: 'TikTok' },
        { file: null, label: 'Instagram', cssOnly: true },
        { file: 'fb.png', label: 'Facebook' },
        { file: 'threads.png', label: 'Threads' },
      ]

      document.querySelectorAll('.footer__social-links a').forEach((link, index) => {
        const social = socialLogos[index]
        if (!social || link.dataset.logoApplied === 'true') return

        link.textContent = ''
        link.classList.add('footer__social-icon-link')
        link.title = social.label
        link.dataset.logoApplied = 'true'

        if (social.cssOnly) {
          link.classList.add('footer__social-icon-link--instagram')
          return
        }

        const icon = document.createElement('img')
        icon.src = asset(social.file)
        icon.alt = `${social.label} logo`
        icon.className = 'footer__social-logo'
        icon.loading = 'lazy'
        icon.decoding = 'async'
        link.append(icon)
      })

      const impactStats = document.querySelectorAll('.impact-stat')

      const palletCard = impactStats[0]
      if (palletCard && !palletCard.querySelector('.impact-stat__visual--pallet')) {
        const palletImage = document.createElement('img')
        palletImage.src = asset('pallet-web.jpg')
        palletImage.alt = 'Recovered pallet wood'
        palletImage.className = 'impact-stat__visual impact-stat__visual--pallet'
        palletImage.loading = 'lazy'
        palletImage.decoding = 'async'
        palletImage.fetchPriority = 'low'
        palletImage.setAttribute('aria-hidden', 'true')
        palletCard.prepend(palletImage)
      }

      const treeCard = impactStats[1]
      if (treeCard && !treeCard.querySelector('.impact-stat__visual--tree')) {
        const treeImage = document.createElement('img')
        treeImage.src = asset('tree.jpg')
        treeImage.alt = 'Tree representing trees saved through pallet upcycling'
        treeImage.className = 'impact-stat__visual impact-stat__visual--tree'
        treeImage.loading = 'lazy'
        treeImage.decoding = 'async'
        treeImage.fetchPriority = 'low'
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
    const handleGmailCompose = (event) => {
      const link = event.target.closest('.footer__email-link')
      if (!link) return

      if (window.innerWidth < 760) return

      event.preventDefault()

      const width = Math.min(720, Math.max(560, window.screen.availWidth - 80))
      const height = Math.min(660, Math.max(520, window.screen.availHeight - 120))
      const left = Math.max(0, Math.round((window.screen.availWidth - width) / 2))
      const top = Math.max(0, Math.round((window.screen.availHeight - height) / 2))
      const popupName = link.href.includes('hr.bruttibesi') ? 'brutti-hr-gmail' : 'brutti-general-gmail'

      const popup = window.open(
        link.href,
        popupName,
        `popup=yes,width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
      )

      if (popup) popup.focus()
    }

    document.addEventListener('click', handleGmailCompose)
    return () => document.removeEventListener('click', handleGmailCompose)
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

  if (view === 'impact-report') {
    return <ImpactReportPage />
  }

  return (
    <>
      <App />
      <CatalogueComingSoonPortal />
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