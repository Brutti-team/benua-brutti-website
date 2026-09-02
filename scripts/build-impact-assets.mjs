import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const sourceDir = path.join(root, 'impact-assets')
const outputDir = path.join(root, 'public', 'assets')

if (!fs.existsSync(sourceDir)) {
  console.log('No impact report assets to build.')
  process.exit(0)
}

fs.mkdirSync(outputDir, { recursive: true })

for (let sprite = 1; sprite <= 5; sprite += 1) {
  const prefix = `impact-pages-${sprite}.part-`
  const parts = fs.readdirSync(sourceDir)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.b64'))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  if (!parts.length) {
    throw new Error(`Missing base64 parts for impact-pages-${sprite}.webp`)
  }

  const encoded = parts
    .map((name) => fs.readFileSync(path.join(sourceDir, name), 'utf8'))
    .join('')
    .replace(/\s+/g, '')

  const output = path.join(outputDir, `impact-pages-${sprite}.webp`)
  fs.writeFileSync(output, Buffer.from(encoded, 'base64'))
  console.log(`Built ${path.relative(root, output)} from ${parts.length} parts`)
}
