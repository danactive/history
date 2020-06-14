const config = require('../../../../config.json');

function isImage(file) {
  return (file.mediumType === 'image' && config.supportedFileTypes.photo.includes(file.ext.toLowerCase()));
}

function parseQueryString(find, from) {
  if (!find || !from) return '';
  return RegExp(`[?&]${find}(=([^&#]*)|&|#|$)`).exec(from)[2];
}

function addUpFolderPath(itemFiles, path) {
  const file = {
    filename: '..',
    mediumType: 'folder',
  };

  if (path) {
    if (path.lastIndexOf('/') > -1) {
      const splitPath = path.split('/');
      splitPath.pop();
      itemFiles.unshift({
        path: splitPath.join('/'),
        ...file,
      });
    } else {
      itemFiles.unshift({
        path: '',
        ...file,
      });
    }
  }

  return itemFiles;
}

export default {
  addUpFolderPath,
  isImage,
  parseQueryString,
};
