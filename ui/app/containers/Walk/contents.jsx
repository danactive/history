import React from 'react';

import Placeholder from './placeholder';

import walkUtils from './util';

const { areImages } = walkUtils;

function Contents({ files }) {
  const thumbs = files.map((file) => {
    if (areImages(file)) {
      return <Placeholder file={file} key={file.filename} />;
    }

    if (file.mediumType === 'folder') {
      const href = `?path=${file.path}`;
      return (
        <li key={file.filename}>
          <a href={href}>
            {file.filename}
          </a>
        </li>
      );
    }

    return (
      <li key={file.filename}>
        {file.filename}
      </li>
    );
  });

  return (
    <ul>
      {thumbs}
    </ul>
  );
}

export default Contents;
