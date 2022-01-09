import React from 'react'
import { render } from '@testing-library/react'

import Img from '../index'

const src = 'test.png'
const alt = 'test'
const renderComponent = (props = {}) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  const utils = render(<Img src={src} alt={alt} {...props} />)
  const image = utils.queryByAltText(alt)
  return { ...utils, image }
}

describe('<Img />', () => {
  test('should render an <img> tag', () => {
    const { image } = renderComponent()
    expect(image).toBeInTheDocument()
    expect(image.tagName).toBe('IMG')
  })

  test('should throw when no alt attribute is specified', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* noop */
    })
    render(<Img src={src} />)
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })

  test('should have a src attribute', () => {
    const { image } = renderComponent()
    expect(image).toHaveAttribute('src', src)
  })

  test('should not have a class attribute', () => {
    const { image } = renderComponent()
    expect(image).not.toHaveAttribute('class')
  })

  test('should adopt a className attribute', () => {
    const className = 'test'
    const { image } = renderComponent({ className })
    expect(image).toHaveClass(className)
  })

  test('should not adopt a srcset attribute', () => {
    const srcset = 'test-HD.png 2x'
    const { image } = renderComponent({ srcset })
    expect(image).not.toHaveAttribute('srcset')
  })
})
