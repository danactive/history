import { transform } from '../person'

describe('transform', () => {
  describe('Age', () => {
    test('Missing birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        display: 'John Doe',
        dob: null,
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person, { relativeDate: new Date('2024-11-12') })
      expect(result).toEqual(expected)
    })

    test('On birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        display: 'John Doe (1yr)',
        dob: '2023-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person, { relativeDate: new Date('2024-11-12') })
      expect(result).toEqual(expected)
    })

    test('One before birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        display: 'John Doe (1yr)',
        dob: '2023-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person, { relativeDate: new Date('2025-11-11') })
      expect(result).toEqual(expected)
    })

    test('One after birthday', () => {
      const expected = {
        first: 'John',
        last: 'Doe',
        full: 'John Doe',
        display: 'John Doe (3yrs)',
        dob: '2021-11-12',
      }
      const person = {
        $: {
          first: expected.first,
          last: expected.last,
          dob: expected.dob,
        },
      }
      const result = transform(person, { relativeDate: new Date('2024-11-13') })
      expect(result).toEqual(expected)
    })
  })
})
