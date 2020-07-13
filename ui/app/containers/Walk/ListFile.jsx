import React from 'react';

import Link from '../../components/Link';
import ListItem from '../../components/ListItem';

function ListFile({ item: file }) {
  if (!file) return null;

  if (file.mediumType === 'folder') {
    return (
      <ListItem item={<Link to={`#path=${file.path}`}>{file.content}</Link>} />
    );
  }

  return <ListItem item={file.content} />;
}

export default ListFile;
