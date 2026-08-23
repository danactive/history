import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { generateGalleryTypes } from './generate-gallery-types'

async function generate() {
  const outputPath = await generateGalleryTypes({
    galleriesDirectory: 'public/galleries',
    outputPath: join(dirname(fileURLToPath(import.meta.url)), '../src/types/generated.ts'),
  })
  console.log(`✅ Types generated at ${outputPath}`)
}

generate().catch((err) => {
  console.error('❌ Failed to generate types:', err)
  process.exit(1)
})
