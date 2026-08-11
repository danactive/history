import { describe, expect, test } from 'vitest'

import { buildPersonGuiHref, getGuiOrigin } from '../monthDay'

describe('month-day links', () => {
  test('serializes person names that contain query syntax', () => {
    const href = buildPersonGuiHref('demo', 'Avery (Admin) || person:Other')

    expect(new URL(href).searchParams.get('query')).toBe('person:"Avery (Admin) || person:Other"')
  })

  test('uses the configured public origin for generated app links', () => {
    expect(getGuiOrigin('https://history.example.com/mcp')).toBe('https://history.example.com')
  })
})
