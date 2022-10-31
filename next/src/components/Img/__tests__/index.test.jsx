import React from 'react'
import { render } from '@testing-library/react'

import Img from '../index'

const expectedValues = {
  alt: 'Preview thumbnail (scaled down dimensions)',
  src: '/public/galleries/demo/media/thumbs/2001/2001-03-21-01.jpg',
}
const renderComponent = (props = {}) => {
  // eslint-disable-next-line react/jsx-props-no-spreading
  const utils = render(<Img src={expectedValues.src} alt={expectedValues.alt} {...props} />)
  const image = utils.queryByAltText(expectedValues.alt)
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
    render(<Img src={expectedValues.src} />)
    expect(consoleSpy).toHaveBeenCalledTimes(1)
    consoleSpy.mockRestore()
  })

  test('should have a src attribute', () => {
    const { image } = renderComponent()
    expect(image).toHaveAttribute('src')
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

  // Next.js uses srcset
  // test('should not adopt a srcset attribute', () => {
  //   const srcset = 'test-HD.png 2x'
  //   const { image } = renderComponent({ srcset })
  //   expect(image).not.toHaveAttribute('srcset')
  // })
})
