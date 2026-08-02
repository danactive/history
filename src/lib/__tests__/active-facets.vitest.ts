import { describe, expect, test } from 'vitest'

import { getActiveFacetCounts } from '../active-facets'

const context = {
  countries: ['Exampleland'],
  people: ['Fixture Person'],
  tags: ['featured^', 'highlight^'],
}

const items = [
  {
    corpus: 'Exampleland featured one',
    filename: 'fixture-one.jpg',
    search: 'featured^',
    visitedPlace: { country: 'Exampleland', region: null },
    persons: [{ full: 'Fixture Person' }],
  },
  {
    corpus: 'Exampleland featured two',
    filename: 'fixture-two.jpg',
    search: 'featured^',
    visitedPlace: { country: 'Exampleland', region: null },
  },
  {
    corpus: 'Exampleland highlight',
    filename: 'fixture-three.jpg',
    search: 'highlight^',
    visitedPlace: { country: 'Exampleland', region: null },
  },
  {
    corpus: 'Elsewhere featured',
    filename: 'fixture-four.jpg',
    search: 'featured^',
    visitedPlace: { country: 'Elsewhere', region: null },
  },
]

describe('active facets', () => {
  test('counts selected AND facets cumulatively in their written order', () => {
    expect(getActiveFacetCounts({
      items,
      query: 'country:Exampleland && tag:featured^ && person:"Fixture Person"',
      context,
      parsedQuery: {
        mode: 'AND',
        tokens: ['country:Exampleland', 'tag:featured^', 'person:"Fixture Person"'],
        isAdvanced: false,
      },
    })).toEqual({
      advancedQueryCount: null,
      tokenCounts: [3, 2, 1],
    })
  })

  test('keeps individual OR branch counts', () => {
    expect(getActiveFacetCounts({
      items,
      query: 'tag:featured^ || tag:highlight^',
      context,
      parsedQuery: {
        mode: 'OR',
        tokens: ['tag:featured^', 'tag:highlight^'],
        isAdvanced: false,
      },
    })).toEqual({
      advancedQueryCount: null,
      tokenCounts: [3, 1],
    })
  })

  test('keeps grouped expressions as one counted advanced facet', () => {
    expect(getActiveFacetCounts({
      items,
      query: 'country:Exampleland && (tag:featured^ || tag:highlight^)',
      context,
      parsedQuery: {
        mode: null,
        tokens: ['country:Exampleland && (tag:featured^ || tag:highlight^)'],
        isAdvanced: true,
      },
    })).toEqual({
      advancedQueryCount: 3,
      tokenCounts: [],
    })
  })
})
