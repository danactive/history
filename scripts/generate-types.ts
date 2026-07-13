import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import getGalleries from '../src/lib/galleries'

async function generate() {
  const { galleries } = await getGalleries()
  const sortedGalleries = [...galleries].sort((left, right) => left.localeCompare(right))

  if (sortedGalleries.length === 0) {
    throw new Error('No galleries found in public/galleries while generating gallery types')
  }

  const galleryValues = sortedGalleries.map((gallery) => JSON.stringify(gallery)).join(', ')
  const galleryUnion = sortedGalleries.map((gallery) => JSON.stringify(gallery)).join(' | ')

  const typeDef = `// AUTO-GENERATED FILE — DO NOT EDIT
import * as z from 'zod/v4'

export const generatedGalleries = [${galleryValues}] as const
export const generatedGallerySchema = z.enum(generatedGalleries)
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
