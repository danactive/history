import { ListItem } from '@mui/joy'

import { type ItemFile } from '../../../pages/admin/walk'
import Link from '../Link'

function ListFile({ item: file }: { item: ItemFile }) {
  if (file.mediumType === 'folder') {
    const href = file.path ? `#path=${file.path}` : ''
    return (
      <ListItem>
        <Link href={href}>{file.label}</Link>
      </ListItem>
    )
  }

  return <ListItem>{file.label}</ListItem>
}

export default ListFile
