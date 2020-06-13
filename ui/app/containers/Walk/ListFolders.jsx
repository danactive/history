import React from 'react';

import A from '../../components/A';
import ListItem from '../../components/ListItem';

import walkUtils from './util';

const { areImages } = walkUtils;

function Contents({ item: file }) {
  if (areImages(file)) {
    return null;
  }

  if (file.mediumType === 'folder') {
    const Link = (
      <A href={`?path=${file.path}`}>
        {file.filename}
      </A>
    );

    return (<ListItem item={Link} />);
  }

  return (
    <ListItem item={file.filename} />
  );
}

export default Contents;
