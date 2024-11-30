import '../__mocks__/jsdom-missing' // Must be imported before the tested file

import { render } from '@testing-library/react'

import Home from '../app/page'

test('renders deploy link', () => {
  const { getByText } = render(<Home galleries={[{ id: 'demo', gallery: 'demo' }]} />)
  const h1 = getByText(
    /List of Galleries/,
  )
  expect(h1).toBeInTheDocument()
})
