import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import getAlbums from '../src/lib/albums'

async function generate() {
  const galleryAlbum = await getAlbums()

  const keys = Object.keys(galleryAlbum)
  const galleryUnion = keys.map((key) => `'${key}'`).join(' | ')

  const typeDef = `// AUTO-GENERATED FILE — DO NOT EDIT
export type GeneratedGallery = ${galleryUnion}
`

  const outputPath = join(dirname(fileURLToPath(import.meta.url)), '../src/types/generated.ts')
  await writeFile(outputPath, typeDef, 'utf-8')

  console.log(`✅ Types generated at ${outputPath}`)
}

generate().catch((err) => {
  console.error('❌ Failed to generate types:', err)
  process.exit(1)
})
