const React = require('react');

const Placeholder = require('./placeholder');
const walkFiles = require('../lib/files');

function Contents({ files }) {
  const thumbs = files.map((file) => {
    if (walkFiles.areImages(file)) {
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

module.exports = Contents;
