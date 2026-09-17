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

function bruttiSiteDirectory() {
  return {
    name: 'brutti-site-directory',
    transformIndexHtml() {
      const links = sitePages
        .map(([label, href]) => `<a href="${href}"><span>${label}</span><span>→</span></a>`)
        .join('')

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
          attrs: { rel: 'stylesheet', href: '/site-directory.css' },
          injectTo: 'head',
        },
        {
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          children: JSON.stringify(structuredData),
          injectTo: 'head',
        },
        {
          tag: 'nav',
          attrs: { class: 'seo-directory', 'aria-label': 'Explore Benua Brutti' },
          children: `<div class="seo-directory__inner"><div><p class="seo-directory__label">Explore Brutti</p><p class="seo-directory__title">More from Benua Brutti</p></div><div class="seo-directory__links">${links}</div></div>`,
          injectTo: 'body',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), bruttiSiteDirectory()],
  base: '/',
})
