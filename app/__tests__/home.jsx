import React from 'react'
import { render } from '@testing-library/react'
import Home from '../pages'

test('renders deploy link', () => {
  const { getByText } = render(<Home />)
  const h1 = getByText(
    /List of Galleries/,
  )
  expect(h1).toBeInTheDocument()
})
