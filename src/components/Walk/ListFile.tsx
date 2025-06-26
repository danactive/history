import { ListItem } from '@mui/joy'

import type { Walk } from '../../types/pages'
import Link from '../Link'

function ListFile({ item: file, route }: { item: Walk.ItemFile, route: string }) {
  if (file.mediumType === 'folder') {
    const href = file.path ? `${route}${file.path}` : ''
    return (
      <ListItem>
        {href ? <Link href={href}>{file.label}</Link> : file.label}
      </ListItem>
    )
  }

  return <ListItem>{file.label}</ListItem>
}

export default ListFile
