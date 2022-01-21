import { render } from '@testing-library/react'

import GenericList from '../index'

describe('<GenericList />', () => {
  test('loading', () => {
    const { container } = render(<GenericList loading />)
    expect(container.querySelector('[data-testid="loader"][rotate="0"]')).toBeTruthy()
  })
})
