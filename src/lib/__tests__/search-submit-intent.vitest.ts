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

  test('turns classified tags and years into first-class submissions', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'tag^ (1)',
        value: 'tag^',
        filterKind: 'tag',
      },
      inputValue: 'tag^',
    })).toEqual({
      type: 'tag',
      tag: 'tag^',
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
      year: '2024',
      option: undefined,
    })
  })

  test('keeps compound ad-hoc expressions on the keyword path', () => {
    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'Add "best^ && highlight^"',
        value: 'best^ && highlight^',
        isCreateOption: true,
      },
      inputValue: 'best^ && highlight^',
    })).toEqual({
      type: 'keyword',
      keyword: 'best^ && highlight^',
    })

    expect(resolveSearchSubmitIntent({
      selectedOption: {
        label: 'Add "2026 || 2027"',
        value: '2026 || 2027',
        isCreateOption: true,
      },
      inputValue: '2026 || 2027',
    })).toEqual({
      type: 'keyword',
      keyword: '2026 || 2027',
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
