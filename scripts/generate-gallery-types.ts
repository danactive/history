import { readdir, writeFile } from 'node:fs/promises'

const toSingleQuotedLiteral = (value: string) => (
  `'${JSON.stringify(value).slice(1, -1).replaceAll("'", "\\'")}'`
)

export function galleryTypeDefinition(galleries: string[]) {
  const sortedGalleries = [...galleries].sort((left, right) => left.localeCompare(right))
  if (sortedGalleries.length === 0) {
    throw new Error('No galleries found in public/galleries while generating gallery types')
  }

  const galleryValues = sortedGalleries.map(toSingleQuotedLiteral).join(', ')
  const galleryUnion = sortedGalleries.map(toSingleQuotedLiteral).join(' | ')

  return `// AUTO-GENERATED FILE — DO NOT EDIT
import * as z from 'zod/v4'

export const generatedGalleries = [${galleryValues}] as const
export const generatedGallerySchema = z.enum(generatedGalleries)
export type GeneratedGallery = ${galleryUnion}
`
}

export async function generateGalleryTypes(
  { galleriesDirectory, outputPath }: { galleriesDirectory: string, outputPath: string },
) {
  const contents = await readdir(galleriesDirectory, { withFileTypes: true })
  const galleries = contents.filter(content => content.isDirectory()).map(content => content.name)
  const typeDefinition = galleryTypeDefinition(galleries)
  await writeFile(outputPath, typeDefinition, 'utf-8')
  return outputPath
}
