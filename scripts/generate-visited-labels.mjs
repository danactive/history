// Regenerate local label anchors: rtk node scripts/generate-visited-labels.mjs
import { readFileSync, writeFileSync } from 'node:fs'

function area(ring) {
  return Math.abs(ring.reduce((sum, p, i) => {
    const q = ring[(i + 1) % ring.length]
    return sum + p[0] * q[1] - q[0] * p[1]
  }, 0) / 2)
}

// Signed distance to the polygon, including holes. Coordinates are locally
// scaled in longitude so high-latitude regions get useful visual centers.
function distance(x, y, polygon) {
  let inside = false
  let nearest = Infinity
  for (const ring of polygon) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const a = ring[i], b = ring[j]
      if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside
      const dx = b[0] - a[0], dy = b[1] - a[1]
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy) || 0))
      nearest = Math.min(nearest, (x - a[0] - t * dx) ** 2 + (y - a[1] - t * dy) ** 2)
    }
  }
  return (inside ? 1 : -1) * Math.sqrt(nearest)
}

function anchor(polygon) {
  const latitude = polygon[0].reduce((sum, p) => sum + p[1], 0) / polygon[0].length
  const scale = Math.cos(latitude * Math.PI / 180)
  const rings = polygon.map(ring => ring.map(([x, y]) => [x * scale, y]))
  const xs = rings[0].map(p => p[0]), ys = rings[0].map(p => p[1])
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys)
  const cell = (x, y, h) => {
    const d = distance(x, y, rings)
    return { x, y, h, d, max: d + h * Math.SQRT2 }
  }
  let best = cell((minX + maxX) / 2, (minY + maxY) / 2, 0)
  const queue = [cell(best.x, best.y, Math.max(maxX - minX, maxY - minY) / 2)]
  // Best-first subdivision to ~500m, with a finer tolerance for small regions.
  const precision = Math.min(0.005, Math.min(maxX - minX, maxY - minY) / 100)
  while (queue.length) {
    queue.sort((a, b) => a.max - b.max)
    const c = queue.pop()
    if (c.d > best.d) best = c
    if (c.max - best.d <= precision) continue
    const h = c.h / 2
    for (const dx of [-h, h]) for (const dy of [-h, h]) queue.push(cell(c.x + dx, c.y + dy, h))
  }
  if (best.d <= 0) throw new Error('No interior label anchor')
  return { label: [best.x / scale, best.y], labelRadius: best.d / scale }
}

for (const country of ['japan', 'usa', 'canada', 'mexico']) {
  const path = `public/maps/visited/${country}.geojson`
  const data = JSON.parse(readFileSync(path, 'utf8'))
  for (const feature of data.features) {
    const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
    // Natural Earth splits at the dateline: largest part selects mainland Alaska,
    // Hokkaido, Honshu prefectures, and main islands rather than offshore fragments.
    const main = [...polygons].sort((a, b) => area(b[0]) - area(a[0]))[0]
    const p = feature.properties
    Object.assign(p, anchor(main), { abbreviation: country === 'japan' ? p.id : p.id.split('-')[1] })
  }
  writeFileSync(path, JSON.stringify(data) + '\n')
  console.log(`${country}: ${data.features.length} interior label anchors`)
}
