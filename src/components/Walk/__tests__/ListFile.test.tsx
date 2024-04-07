import { render } from '@testing-library/react'

import ListFile from '../ListFile'
import { type ItemFile } from '../../../../pages/admin/walk'

describe('<ListFile />', () => {
  const mockItemFile: ItemFile = {
    id: '123',
    label: 'One Two Three',
    path: '123',
  }
  test('should render file label', () => {
    const label = 'label'
    const { getByText } = render(<ListFile item={{ ...mockItemFile, label }} />)
    expect(getByText(label)).toBeInTheDocument()
  })
  test('should render a folder with path', () => {
    const path = 'testPath'
    const label = 'Link text'
    const { getByText } = render(<ListFile
      item={{
        ...mockItemFile,
        mediumType: 'folder',
        path,
        label,
      }}
    />)
    expect(getByText(label).closest('a')?.href).toBe(`http://localhost/#path=${path}`)
  })
  test('should render a folder with path', () => {
    const path = ''
    const label = 'Link text'
    const { getByText } = render(<ListFile
      item={{
        ...mockItemFile,
        mediumType: 'folder',
        path,
        label,
      }}
    />)
    expect(getByText(label).closest('a')?.href).toBe('http://localhost/')
  })
})
