import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const sitePages = [
  ['About Brutti', '/about/'],
  ['Our Journey', '/journey/'],
  ['What We Build', '/what-we-build/'],
  ['Impact Report', '/impact/'],
  ['Career', '/career/'],
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
        mainEntity: {
          '@type': 'ItemList',
          name: 'Brutti main pages',
          itemListElement: sitePages.map(([name, path], index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name,
            url: `https://brutti.my${path}`,
          })),
        },
      }

      const cleanedHtml = html
        .replace(/\s*<link rel="icon"[^>]*>\s*/gi, '\n')
        .replace(/\s*<link rel="shortcut icon"[^>]*>\s*/gi, '\n')
        .replace(/\s*<link rel="apple-touch-icon"[^>]*>\s*/gi, '\n')

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
              type: 'image/svg+xml',
              sizes: 'any',
              href: '/favicon.svg?v=20261008',
            },
            injectTo: 'head',
          },
          {
            tag: 'link',
            attrs: {
              rel: 'apple-touch-icon',
              href: '/assets/logo%20brutti.jpg?favicon=actual-logo-20260917-7',
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


/*
 * Give each React-driven public page its own index.html in dist.
 * Google can then read a distinct title, description and canonical URL
 * without relying on JavaScript navigation. The same app bundle and
 * existing page layout are used for all of them.
 */
const appPages = [
  {
    slug: 'journey',
    title: 'Our Journey | Benua Brutti Sdn Bhd',
    description: 'Follow the story of Benua Brutti, from a backyard DIY idea in Sabah to a team creating custom furniture and giving pallet wood a second life.',
    name: 'Our Journey',
  },
  {
    slug: 'impact',
    title: 'Impact Report 2026 | Benua Brutti',
    description: 'Explore the Benua Brutti Impact Report 2026, featuring our work, people and progress in giving recovered pallet wood a second life in Sabah.',
    name: 'Impact Report',
  },
  {
    slug: 'career',
    title: 'Careers at Brutti | Jobs & Internship in Sabah',
    description: 'Explore career and internship opportunities at Benua Brutti in Kota Kinabalu, Sabah, including workshop, production, artisan and operator roles.',
    name: 'Career',
  },
]

function bruttiAppPageSeo() {
  return {
    name: 'brutti-app-page-seo',
    apply: 'build',
    async closeBundle() {
      const distDir = join(process.cwd(), 'dist')
      const template = await readFile(join(distDir, 'index.html'), 'utf8')

      for (const page of appPages) {
        const url = `https://brutti.my/${page.slug}/`
        const replace = (html, pattern, replacement) => {
          if (!pattern.test(html)) throw new Error(`Missing SEO tag for ${page.slug}: ${pattern}`)
          return html.replace(pattern, replacement)
        }

        let html = template
        html = replace(html, /<title>[\s\S]*?<\/title>/i, `<title>${page.title}</title>`)
        html = replace(html, /<meta name="description" content="[^"]*"\s*\/>/i,
          `<meta name="description" content="${page.description}" />`)
        html = replace(html, /<link rel="canonical" href="[^"]*"\s*\/>/i,
          `<link rel="canonical" href="${url}" />`)
        html = replace(html, /<meta property="og:title" content="[^"]*"\s*\/>/i,
          `<meta property="og:title" content="${page.title}" />`)
        html = replace(html, /<meta property="og:description" content="[^"]*"\s*\/>/i,
          `<meta property="og:description" content="${page.description}" />`)
        html = replace(html, /<meta property="og:url" content="[^"]*"\s*\/>/i,
          `<meta property="og:url" content="${url}" />`)
        html = replace(html, /<meta name="twitter:title" content="[^"]*"\s*\/>/i,
          `<meta name="twitter:title" content="${page.title}" />`)
        html = replace(html, /<meta name="twitter:description" content="[^"]*"\s*\/>/i,
          `<meta name="twitter:description" content="${page.description}" />`)

        const breadcrumb = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://brutti.my/' },
            { '@type': 'ListItem', position: 2, name: page.name, item: url },
          ],
        }
        html = replace(html, /<\/head>/i,
          `  <script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n  </head>`)

        const outputFolder = join(distDir, page.slug)
        await mkdir(outputFolder, { recursive: true })
        await writeFile(join(outputFolder, 'index.html'), html, 'utf8')
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), bruttiStructuredData(), bruttiAppPageSeo()],
  base: '/',
})
