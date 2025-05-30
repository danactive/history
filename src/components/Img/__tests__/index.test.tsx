import { render, screen } from '@testing-library/react'

import Img from '../index'

const expectedValues = {
  alt: 'Preview thumbnail (scaled down dimensions)',
  src: '/public/galleries/demo/media/thumbs/2001/2001-03-21-01.jpg',
}
const renderComponent = (props = {}) => {
  render(<Img src={expectedValues.src} alt={expectedValues.alt} {...props} />)
  const image = screen.queryByAltText(expectedValues.alt)
  return { image }
}

describe('<Img />', () => {
  test('should render an <img> tag', () => {
    const { image } = renderComponent()
    expect(image).toBeInTheDocument()
    expect(image?.tagName).toBe('IMG')
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
