import { ListItem } from '@mui/joy'

import { type ItemFile } from '../../../pages/admin/walk'
import Link from '../Link'

function ListFile({ item: file }: { item: ItemFile }) {
  if (!file || !file.content) return null

  if (file.mediumType === 'folder') {
    return (
      <ListItem>
        <Link href={`#path=${file.path}`}>{file.content}</Link>
      </ListItem>
    )
  }

  return <ListItem>{file.content}</ListItem>
}

export default ListFile
