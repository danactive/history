import { render, screen } from '@testing-library/react'

import ListFile from '../ListFile'
import type { Walk } from '../../../types/pages'

describe('<ListFile />', () => {
  const mockItemFile: Walk.ItemFile = {
    id: '123',
    label: 'One Two Three',
    path: '123',
    mediumType: 'unknown',
    ext: 'txt',
    name: 'file.txt',
    filename: 'file.txt',
    absolutePath: '/absolute/path/to/file.txt',
  }
  test('should render file label', () => {
    const label = 'label'
    render(<ListFile item={{ ...mockItemFile, label }} route='/admin/walk' />)
    const labelElement = screen.queryByText(label)
    expect(labelElement).toBeInTheDocument()
  })
  test('should render a folder with path', () => {
    const path = '/testPath'
    const label = 'Link text'
    render(
      <ListFile
        item={{
          ...mockItemFile,
          mediumType: 'folder',
          path,
          label,
        }}
        route='/admin/walk'
      />,
    )

    const linkElement = screen.queryByRole('link', { name: label })
    expect(linkElement).toHaveAttribute('href', `/admin/walk${path}`)
  })
  test('should render a folder with path', () => {
    const path = ''
    const label = 'Link text'
    render(
      <ListFile
        item={{
          ...mockItemFile,
          mediumType: 'folder',
          path,
          label,
        }}
        route='/admin/walk'
      />,
    )

    const linkElement = screen.queryByRole('link', { name: label })
    expect(linkElement).not.toBeInTheDocument()
  })
})
