import { ListItem } from '@mui/joy'

import Link from '../Link'

function ListFile({ item: file }) {
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
