import React from 'react'
import { render } from '@testing-library/react'

import Item from '../Item'

describe('<Item />', () => {
  test('should render an <div> tag', () => {
    const { container } = render(<Item />)
    expect(container.firstChild.tagName).toEqual('DIV')
  })

  test('should have a class attribute', () => {
    const { container } = render(<Item />)
    expect(container.firstChild).toHaveAttribute('class')
  })

  test('should adopt a valid attribute', () => {
    const id = 'test'
    const { container } = render(<Item id={id} />)
    expect(container.firstChild).toHaveAttribute('id')
    expect(container.firstChild.id).toEqual(id)
  })

  test('should not adopt an invalid attribute', () => {
    const { container } = render(<Item attribute="test" />)
    expect(container.firstChild).not.toHaveAttribute('attribute')
  })
})
