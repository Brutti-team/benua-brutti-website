import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const sitePages = [
  ['About Brutti', '/about/'],
  ['Our Journey', '/journey/'],
  ['What We Build', '/what-we-build/'],
  ['Impact Report', '/impact/'],
  ['Catalogue', '/catalogue/'],
  ['Contact', '/contact/'],
]

function bruttiStructuredData() {
  return {
    name: 'brutti-structured-data',
    transformIndexHtml() {
      const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Brutti™',
        alternateName: 'Benua Brutti Sdn Bhd',
        url: 'https://brutti.my/',
        hasPart: sitePages.map(([name, path]) => ({
          '@type': 'WebPage',
          name,
          url: `https://brutti.my${path}`,
        })),
      }

      return [
        {
          tag: 'link',
          attrs: { rel: 'stylesheet', href: '/collaborators-mobile-lightbox-fix.css?v=20260917-2' },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg?v=20260917-4' },
          injectTo: 'head',
        },
        {
          tag: 'link',
          attrs: { rel: 'shortcut icon', href: '/favicon.svg?v=20260917-4' },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(structuredData),
          injectTo: 'head',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), bruttiStructuredData()],
  base: '/',
})
