import { render } from '@testing-library/react'

import ListFile from '../ListFile'

describe('<ListFile />', () => {
  test('should render file content', () => {
    const content = 'content'
    const { getByText } = render(<ListFile item={{ content }} />)
    expect(getByText(content)).toBeInTheDocument()
  })
  test('should render a folder', () => {
    const path = 'testPath'
    const content = 'Link text'
    const { getByText } = render(<ListFile item={{ mediumType: 'folder', path, content }} />)
    expect(getByText(content).href).toBe(`http://localhost/#path=${path}`)
  })
})
