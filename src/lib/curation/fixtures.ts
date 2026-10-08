import fs from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mapCountries } from '../../components/VisitedMap/regions'

export async function curationFixture() {
  const root = await fs.mkdtemp(join(tmpdir(), 'history-curation-'))
  await fs.mkdir(join(root, 'public/maps/visited'), { recursive: true })
  for (const [country, config] of Object.entries(mapCountries)) {
    const names = country === 'Canada' ? ['Ontario', 'British Columbia'] : []
    await fs.writeFile(join(root, `public/maps/visited/${config.file}.geojson`), JSON.stringify({
      type: 'FeatureCollection', features: names.map((name, index) => ({
        type: 'Feature', geometry: { type: 'Polygon', coordinates: [] },
        properties: { id: String(index), name, aliases: index === 1 ? ['BC'] : ['ON'], label: [0, 0] },
      })),
    }))
  }
  await fs.writeFile(join(root, 'config.local.json'), JSON.stringify({ 'critical-tags': ['best^'] }))
  return root
}

export async function fixtureGallery(root: string, gallery: string, albums: Record<string, string>) {
  const directory = join(root, 'public/galleries', gallery)
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(join(directory, 'gallery.xml'), `<gallery>${Object.keys(albums)
    .map(name => `<album><album_name>${name}</album_name><album_h1>${name}</album_h1></album>`).join('')}</gallery>`)
  for (const [name, items] of Object.entries(albums)) await fs.writeFile(join(directory, `${name}.xml`), `<album>${items}</album>`)
}

export function fixtureItem(id: string, city = 'Toronto, Ontaro, Canada', extra = '') {
  return `<item id="${id}"><filename>2020-photo-${id}.jpg</filename><photo_city>${city}</photo_city>`
    + `<photo_loc>Old Montréal</photo_loc>${extra}</item>`
}
