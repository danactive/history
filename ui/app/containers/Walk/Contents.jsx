import React from 'react';

import A from '../../components/A';
import ListItem from '../../components/ListItem';
import Placeholder from './Placeholder';

import walkUtils from './util';

const { areImages } = walkUtils;

function Contents({ item: file }) {
  const key = `contents-${file.id.replace(/\//, '-') || 'missingId'}`;
  if (areImages(file)) {
    return <Placeholder file={file} key={key} />;
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
