import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

test('renders deploy link', async () => {
  const Component = await Home()

  render(Component)
  const h1 = screen.queryByText(/List of Galleries/)
  expect(h1).toBeInTheDocument()
})
