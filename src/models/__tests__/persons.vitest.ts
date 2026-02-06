import { describe, expect, test } from 'vitest'

import { transform } from '../person'

describe('transform', () => {
  describe('Age', () => {
    test('Missing birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        dob: null,
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person)
      expect(result).toEqual(expected)
    })

    test('On birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        dob: '2023-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person)
      expect(result).toEqual(expected)
    })

    test('One before birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        dob: '2023-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person)
      expect(result).toEqual(expected)
    })

    test('One after birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        dob: '2021-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person)
      expect(result).toEqual(expected)
    })
  })
})
