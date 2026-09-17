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
    transformIndexHtml(html) {
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

      const cleanedHtml = html
        .replace(/\s*<link rel="icon"[^>]*favicon\.svg[^>]*>\s*/gi, '\n')
        .replace(/\s*<link rel="shortcut icon"[^>]*favicon\.svg[^>]*>\s*/gi, '\n')

      return {
        html: cleanedHtml,
        tags: [
          {
            tag: 'link',
            attrs: { rel: 'stylesheet', href: '/collaborators-mobile-lightbox-fix.css?v=20260917-2' },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: {
              rel: 'icon',
              type: 'image/jpeg',
              href: '/assets/logo%20brutti.jpg?v=20260917-direct',
            },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: {
              rel: 'shortcut icon',
              type: 'image/jpeg',
              href: '/assets/logo%20brutti.jpg?v=20260917-direct',
            },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: {
              rel: 'apple-touch-icon',
              href: '/assets/logo%20brutti.jpg?v=20260917-direct',
            },
            injectTo: 'head',
          },
          {
            tag: 'script',
            attrs: { type: 'application/ld+json' },
            children: JSON.stringify(structuredData),
            injectTo: 'head',
          },
        ],
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), bruttiStructuredData()],
  base: '/',
})
