import React from 'react';

import A from '../../components/A';
import ListItem from '../../components/ListItem';

function ListFile({ item: file }) {
  if (!file) return null;

  if (file.mediumType === 'folder') {
    const Link = <A href={`#path=${file.path}`}>{file.content}</A>;

    return <ListItem item={Link} />;
  }

  return <ListItem item={file.content} />;
}

export default ListFile;
