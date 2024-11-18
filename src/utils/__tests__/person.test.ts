import applyAge from '../person'

describe('Utilities', () => {
  describe('applyAge', () => {
    test('Missing person', () => {
      const persons = null
      const filename = '2024-11-16'
      expect(applyAge(persons, filename)).toBe('')
    })

    test('Missing dob', () => {
      const persons = [{ dob: null, full: 'John Doe' }]
      const filename = '2024-11-16'
      expect(applyAge(persons, filename)).toBe(persons[0].full)
    })

    test('Invalid birth year', () => {
      const persons = [{ dob: '2020-11-16', full: 'John Doe' }]
      const filename = 'unknown-summer-16'
      expect(applyAge(persons, filename)).toBe(persons[0].full)
    })

    test('Valid date of birth', () => {
      const persons = [{ dob: '2020-11-16', full: 'John Doe' }]
      const filename = '2024-11-16'
      expect(applyAge(persons, filename)).toBe(`${persons[0].full} (4yrs)`)
    })

    test('Invalid birth month', () => {
      const persons = [{ dob: '2020-11-16', full: 'John Doe' }]
      const filename = '2024-summer-16'
      expect(applyAge(persons, filename)).toBe(`${persons[0].full} (~4yrs)`)
    })

    test('Birth year only', () => {
      const persons = [{ dob: '2020', full: 'John Doe' }]
      const filename = '2024-11-17'
      expect(applyAge(persons, filename)).toBe(`${persons[0].full} (~4yrs)`)
    })

    test('Retain person order', () => {
      const persons = [{ dob: '2020-11-16', full: 'Jane Doe' }, { dob: '2023-11-16', full: 'John Doe' }]
      const filename = '2024-11-16'
      expect(applyAge(persons, filename)).toBe(`${persons[0].full} (4yrs), ${persons[1].full} (1yr)`)
    })
  })
})
