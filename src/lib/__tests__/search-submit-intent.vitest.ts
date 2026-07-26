import { describe, expect, test } from 'vitest'

import { resolveSearchSubmitIntent } from '../search-submit-intent'

describe('search submit intent', () => {
  test('prefers visited selections', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'Lisbon, Portugal (4)',
        value: 'Lisbon, Portugal',
        visitedPlace: { country: 'Portugal', region: 'Lisbon' },
      },
      inputValue: 'Lisbon',
    })).toEqual({
      type: 'visited',
      visitedPlace: { country: 'Portugal', region: 'Lisbon' },
    })
  })

  test('preserves structured selections for route-specific handlers', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'Alice (1)',
        value: 'Alice',
      },
      inputValue: 'Alice',
    })).toEqual({
      type: 'structured',
      option: {
        label: 'Alice (1)',
        value: 'Alice',
      },
    })
  })

  test('promotes created options to keyword submissions', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'Add "breakfast"',
        value: 'breakfast',
        isCreateOption: true,
      },
      inputValue: 'breakfast',
    })).toEqual({
      type: 'keyword',
      keyword: 'breakfast',
    })
  })

  test('falls back to trimmed input text', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: null,
      inputValue: '  breakfast  ',
    })).toEqual({
      type: 'keyword',
      keyword: 'breakfast',
    })
  })

  test('returns noop for empty submissions', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: null,
      inputValue: '   ',
    })).toEqual({
      type: 'noop',
    })
  })
})
