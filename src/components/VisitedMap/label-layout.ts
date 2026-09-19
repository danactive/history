export type LabelCandidate = {
  id: string
  name: string
  abbreviation: string
  x: number
  y: number
  room: number
  visited: boolean
}
export type PlacedLabel = LabelCandidate & { text: string, left: number, top: number, width: number }
const HEIGHT = 18

// With pitch locked to zero, the camera sits above the map center. A surface
// normal faces that camera only when its dot product exceeds R / (R + altitude).
export function aboveHorizon(anchor: [number, number], center: { lng: number, lat: number }, altitude: number) {
  const radians = Math.PI / 180
  const cosine = Math.sin(anchor[1] * radians) * Math.sin(center.lat * radians)
    + Math.cos(anchor[1] * radians) * Math.cos(center.lat * radians) * Math.cos((anchor[0] - center.lng) * radians)
  return cosine > 6371008.8 / (6371008.8 + altitude)
}

export function sameLocation(a: { lng: number, lat: number }, b: [number, number]) {
  const longitude = ((a.lng - b[0] + 540) % 360) - 180
  return Math.abs(longitude) < 0.1 && Math.abs(a.lat - b[1]) < 0.1
}

export function layoutLabels(candidates: LabelCandidate[], width: number, height: number, measure: (text: string) => number) {
  const placed: PlacedLabel[] = []
  const fits = (x: number, y: number, w: number) => x - w / 2 >= 4 && x + w / 2 <= width - 4
    && y - HEIGHT / 2 >= 4 && y + HEIGHT / 2 <= height - 30
    && !(x + w / 2 > width - 48 && y < 90) // Zoom controls.
    && placed.every(other => Math.abs(other.left - x) >= (other.width + w) / 2 + 3 || Math.abs(other.top - y) >= HEIGHT + 2)

  // IDs give deterministic ordering across country changes and async load order.
  for (const candidate of [...candidates].sort((a, b) => a.id.localeCompare(b.id))) {
    const full = candidate.name.replace(/ Prefecture$/, '')
    let text = full
    let w = measure(text) + 8
    let x = candidate.x, y = candidate.y
    if (w > candidate.room || !fits(x, y, w)) {
      text = measure(candidate.abbreviation) < measure(full) ? candidate.abbreviation : full
      w = measure(text) + 8
    }
    if (!fits(x, y, w)) {
      let found = false
      // Search outward, keeping the leader as short as available space permits.
      for (let radius = 12; radius < Math.max(width, height) && !found; radius += 12) {
        const steps = Math.max(8, Math.ceil(2 * Math.PI * radius / 16))
        for (let step = 0; step < steps; step++) {
          const angle = step * 2 * Math.PI / steps
          const nx = candidate.x + Math.cos(angle) * radius
          const ny = candidate.y + Math.sin(angle) * radius
          if (fits(nx, ny, w)) { x = nx; y = ny; found = true; break }
        }
      }
    }
    placed.push({ ...candidate, text, left: x, top: y, width: w })
  }
  return placed
}
