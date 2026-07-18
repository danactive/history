import { describe, expect, test } from 'vitest'

import { getTodayItems } from '../today'

describe('today library', () => {
  test('orders location options by highest count first', async () => {
    const result = await getTodayItems('dan', '07-18')
    const counts = result.locationOptions.map((option) => Number(option.label.match(/\((\d+)\)$/)?.[1] ?? 0))

    expect(counts.length).toBeGreaterThan(1)
    expect(counts).toEqual([...counts].sort((left, right) => right - left))
  })
})
