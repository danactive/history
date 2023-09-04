import { render } from '@testing-library/react'

import ListFile from '../ListFile'
import { type ItemFile } from '../../../../pages/admin/walk'

describe('<ListFile />', () => {
  const mockItemFile: ItemFile = {
    id: '123',
  }
  test('should render file content', () => {
    const content = 'content'
    const { getByText } = render(<ListFile item={{ ...mockItemFile, content }} />)
    expect(getByText(content)).toBeInTheDocument()
  })
  test('should render a folder', () => {
    const path = 'testPath'
    const content = 'Link text'
    const { getByText } = render(<ListFile
      item={{
        ...mockItemFile,
        mediumType: 'folder',
        path,
        content,
      }}
    />)
    expect(getByText(content).closest('a')?.href).toBe(`http://localhost/#path=${path}`)
  })
})
