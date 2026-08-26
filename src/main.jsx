import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createPortal } from 'react-dom'
import App from './App.jsx'
import Collaborators from './components/Collaborators.jsx'
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

function BruttiSite() {
  useEffect(() => {
    const applyRealAssets = () => {
      const heroPhoto = document.querySelector('.hero__image')
      if (heroPhoto) {
        heroPhoto.src = asset('brutti-team-landscape.jpg')
        heroPhoto.alt = 'Benua Brutti team'
      }

      const storyPhoto = document.querySelector('.story__photo-wrap img')
      if (storyPhoto) {
        storyPhoto.src = asset('founders.jpg')
        storyPhoto.alt = 'Benua Brutti founder and co-founder'
      }

      const sharedShowroom = document.querySelector('.showroom img')
      if (sharedShowroom) {
        sharedShowroom.src = asset('our shared showroom.png')
        sharedShowroom.alt = 'Benua Brutti shared showroom'
      }

      document.querySelectorAll('.brand img, .footer img[alt="Benua Brutti"]').forEach((logo) => {
        logo.src = asset('logo brutti.jpg')
        logo.classList.add('brutti-logo-img')
      })
    }

    applyRealAssets()
    const observer = new MutationObserver(applyRealAssets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <App />
      <CollaboratorsPortal />
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BruttiSite />
  </React.StrictMode>,
)
