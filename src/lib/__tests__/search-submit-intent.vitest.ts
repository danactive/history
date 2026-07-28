import { describe, expect, test } from 'vitest'

import { classifySearchSelection, resolveSearchSubmitIntent } from '../search-submit-intent'

describe('search submit intent', () => {
  test('classifies selected values through one search-domain model', () => {
    expect(classifySearchSelection({
      selectedOption: {
        label: 'Lisbon, Portugal (4)',
        value: 'Lisbon, Portugal',
        visitedPlace: { country: 'Portugal', region: 'Lisbon' },
      },
      inputValue: 'Lisbon',
    })).toEqual({
      kind: 'visited',
      option: {
        label: 'Lisbon, Portugal (4)',
        value: 'Lisbon, Portugal',
        visitedPlace: { country: 'Portugal', region: 'Lisbon' },
      },
      visitedPlace: { country: 'Portugal', region: 'Lisbon' },
    })

    expect(classifySearchSelection({
      selectedOption: { label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' },
      inputValue: 'tag^',
      knownPeople: ['tag^', 'First Middle Last'],
    })).toEqual({
      kind: 'tag',
      option: { label: 'tag^ (1)', value: 'tag^', filterKind: 'tag' },
      value: 'tag^',
    })

    expect(classifySearchSelection({
      selectedOption: { label: 'First Middle Last (1)', value: 'First Middle Last', filterKind: 'person' },
      inputValue: 'First Middle Last',
    })).toEqual({
      kind: 'person',
      option: { label: 'First Middle Last (1)', value: 'First Middle Last', filterKind: 'person' },
      value: 'First Middle Last',
    })

    expect(classifySearchSelection({
      selectedOption: { label: '2024 (1)', value: '2024' },
      inputValue: '2024',
    })).toEqual({
      kind: 'year',
      option: { label: '2024 (1)', value: '2024' },
      value: '2024',
    })

    expect(classifySearchSelection({
      selectedOption: { label: 'Alice Example (1)', value: 'Alice Example' },
      inputValue: 'Alice Example',
      knownPeople: ['Alice Example'],
    })).toEqual({
      kind: 'person',
      option: { label: 'Alice Example (1)', value: 'Alice Example' },
      value: 'Alice Example',
    })
  })

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

  test('turns classified tags and years into keyword-like submissions', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'tag^ (1)',
        value: 'tag^',
        filterKind: 'tag',
      },
      inputValue: 'tag^',
    })).toEqual({
      type: 'tag',
      keyword: 'tag^',
      option: {
        label: 'tag^ (1)',
        value: 'tag^',
        filterKind: 'tag',
      },
    })

    expect(resolveSearchSubmitIntent({
      selectedOption: null,
      inputValue: '2024',
    })).toEqual({
      type: 'year',
      keyword: '2024',
      option: undefined,
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
