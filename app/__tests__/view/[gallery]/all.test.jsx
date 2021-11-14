import React from 'react'
import { render } from '@testing-library/react'
import { useRouter } from 'next/router'
import All from '../../../pages/view/[gallery]/all'

jest.mock('next/router')

test('No results', () => {
  useRouter.mockImplementation(() => ({
    isReady: true,
    query: {
      keyword: 'beach',
    },
    push: jest.fn(),
  }))
  const { getByText } = render(<All />)
  const h3 = getByText(
    /beach results 0 of 0 found/,
  )
  expect(h3).toBeInTheDocument()
})

test('Beach in description', () => {
  useRouter.mockImplementation(() => ({
    isReady: true,
    query: {
      keyword: 'beach',
    },
    push: jest.fn(),
  }))
  const { getByText } = render(<All items={[{ filename: 'id0', content: 'Lovely day for the beach!' }]} />)
  const h3 = getByText(
    /beach results 1 of 1 found/,
  )
  expect(h3).toBeInTheDocument()
})
