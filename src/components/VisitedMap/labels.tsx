'use client'

import { useEffect, useRef, useState } from 'react'
import type { MapRef } from 'react-map-gl/mapbox'
import type { RegionCollection } from './regions'
import { aboveHorizon, layoutLabels, sameLocation, type LabelCandidate, type PlacedLabel } from './label-layout'
import styles from './styles.module.css'

export default function RegionLabels({ map, features }: { map: MapRef | null, features: RegionCollection['features'] }) {
  const [labels, setLabels] = useState<PlacedLabel[]>([])
  const overlay = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const element = overlay.current
    if (!map || !element) return
    // Labels live above the canvas to support hover/focus. Forward zoom input
    // so a label does not create a dead spot in mouse interaction.
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      map.getCanvasContainer().dispatchEvent(new WheelEvent('wheel', {
        bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY,
        deltaX: event.deltaX, deltaY: event.deltaY, deltaMode: event.deltaMode, ctrlKey: event.ctrlKey,
      }))
    }
    const doubleClick = (event: MouseEvent) => {
      map.getCanvasContainer().dispatchEvent(new MouseEvent('dblclick', {
        bubbles: true, cancelable: true, clientX: event.clientX, clientY: event.clientY, shiftKey: event.shiftKey,
      }))
    }
    element.addEventListener('wheel', wheel, { passive: false })
    element.addEventListener('dblclick', doubleClick)
    return () => {
      element.removeEventListener('wheel', wheel)
      element.removeEventListener('dblclick', doubleClick)
    }
  }, [map])
  useEffect(() => {
    if (!map) return
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) return
    context.font = '11px Verdana'
    let previous = ''
    const update = () => {
      const { clientWidth: width, clientHeight: height } = map.getContainer()
      const candidates: LabelCandidate[] = []
      const altitude = map.getFreeCameraOptions().position?.toAltitude() ?? 0
      for (const { properties: p } of features) {
        if (!aboveHorizon(p.label, map.getCenter(), altitude)) continue
        const point = map.project(p.label)
        if (point.x < 0 || point.y < 0 || point.x > width || point.y > height) continue
        // Projecting the far hemisphere can still yield an on-screen point.
        // A visible surface point must round-trip through unproject to its anchor.
        if (!map.isPointOnSurface(point) || !sameLocation(map.unproject(point), p.label)) continue
        const edge = map.project([p.label[0] + p.labelRadius, p.label[1]])
        candidates.push({
          id: p.id, name: p.name, abbreviation: p.abbreviation, visited: !!p.visited,
          x: point.x, y: point.y, room: 2 * Math.hypot(edge.x - point.x, edge.y - point.y),
        })
      }
      const next = layoutLabels(candidates, width, height, text => context.measureText(text).width)
      const serialized = JSON.stringify(next)
      if (serialized !== previous) { previous = serialized; setLabels(next) }
    }
    const raw = map.getMap()
    raw.on('render', update)
    update()
    return () => { raw.off('render', update) }
  }, [map, features])

  return (
    <div ref={overlay} className={styles.labels} aria-label="Administrative region labels">
      <svg className={styles.leaders} aria-hidden="true">
        {labels.filter(label => Math.hypot(label.left - label.x, label.top - label.y) > 2).map(label => (
          <line key={label.id} x1={label.x} y1={label.y} x2={label.left} y2={label.top} />
        ))}
      </svg>
      {labels.map(label => (
        <span
          key={label.id} className={styles.regionLabel} data-visited={label.visited}
          style={{ left: label.left, top: label.top }} tabIndex={0}
          aria-label={`${label.name}${label.visited ? ', visited' : ', not visited'}`} title={label.name}
        >
          {label.text}
          <span className={styles.labelTooltip} role="tooltip">{label.name}</span>
        </span>
      ))}
    </div>
  )
}
