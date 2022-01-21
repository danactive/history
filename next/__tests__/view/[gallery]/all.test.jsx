import { getPage } from 'next-page-tester'
import { screen } from '@testing-library/react'

const { getByText } = screen

test('0 results', async () => {
  const { render } = await getPage({
    route: '/demo/all?keyword=fake',
  })
  render()
  const h3 = getByText(/results 0 of 6 for "fake"/)
  expect(h3).toBeInTheDocument()
})

test('1 result', async () => {
  const { render } = await getPage({
    route: '/demo/all?keyword=gingerbread',
  })
  render()
  const h3 = getByText(/results 1 of 6 for "gingerbread"/)
  expect(h3).toBeInTheDocument()
})

test('Mixed case', async () => {
  const { render } = await getPage({
    route: '/demo/all?keyword=Gingerbread',
  })
  render()
  const h3 = getByText(/results 1 of 6 for "Gingerbread"/)
  expect(h3).toBeInTheDocument()
})
