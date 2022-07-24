import React from 'react'

import Link from '../Link'
import ListItem from '../ListItem'

function ListFile({ item: file }) {
  if (!file || !file.content) return null

  if (file.mediumType === 'folder') {
    return (
      <ListItem item={<Link href={`#path=${file.path}`}>{file.content}</Link>} />
    )
  }

  return <ListItem item={file.content} />
}

export default ListFile
