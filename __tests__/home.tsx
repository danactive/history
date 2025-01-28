import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import Home from '../app/page'

test('renders deploy link', async () => {
  const Component = await Home({
    galleries: [{ id: 'demo', gallery: 'demo' }],
  })

  const { getByText } = render(Component)
  const h1 = getByText(/List of Galleries/)
  expect(h1).toBeInTheDocument()
})
