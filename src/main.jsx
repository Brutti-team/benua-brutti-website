import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'
import './overrides.css'

const asset = (file) => `${import.meta.env.BASE_URL}assets/${file}`

function BruttiSite() {
  useEffect(() => {
    const applyRealAssets = () => {
      const hero = document.querySelector('.hero__image')
      if (hero) {
        hero.src = asset('brutti-team-hero.jpg')
        hero.alt = 'Benua Brutti team'
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
        logo.src = asset('logo-brutti-transparent.png')
        logo.classList.add('brutti-logo-img')
      })
    }

    applyRealAssets()
    const observer = new MutationObserver(applyRealAssets)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [])

  return <App />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BruttiSite />
  </React.StrictMode>,
)
