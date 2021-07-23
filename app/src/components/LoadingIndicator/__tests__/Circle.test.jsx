import React from 'react'
import { render } from '@testing-library/react'

import Circle from '../Circle'

describe('<Circle />', () => {
  test('should render a <div> tag', () => {
    const { container } = render(<Circle />)
    expect(container.firstChild.tagName).toEqual('DIV')
  })

  test('should have a class attribute', () => {
    const { container } = render(<Circle />)
    expect(container.firstChild).toHaveAttribute('class')
  })

  test('should not adopt attributes', () => {
    const id = 'test'
    const { container } = render(<Circle id={id} />)
    expect(container.firstChild).not.toHaveAttribute('id')
  })
})
