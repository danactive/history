import { describe, expect, it } from 'vitest'

import { parseKeywordQuery } from '../useSearch'

describe('parseKeywordQuery', () => {
  it('parses simple AND chains', () => {
    expect(parseKeywordQuery('apple&&banana&&cherry')).toEqual({
      mode: 'AND',
      tokens: ['apple', 'banana', 'cherry'],
      isAdvanced: false,
    })
  })

  it('parses simple OR chains', () => {
    expect(parseKeywordQuery('apple || banana')).toEqual({
      mode: 'OR',
      tokens: ['apple', 'banana'],
      isAdvanced: false,
    })
  })

  it('marks mixed operators as advanced', () => {
    expect(parseKeywordQuery('apple && banana || cherry')).toEqual({
      mode: null,
      tokens: ['apple && banana || cherry'],
      isAdvanced: true,
    })
  })

  it('marks grouped expressions as advanced', () => {
    expect(parseKeywordQuery('(apple||banana)&&cherry')).toEqual({
      mode: null,
      tokens: ['(apple||banana)&&cherry'],
      isAdvanced: true,
    })
  })
})

