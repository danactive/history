const config = require('../../../../config.json');

function isImage(file) {
  return (file.mediumType === 'image' && config.supportedFileTypes.photo.includes(file.ext.toLowerCase()));
}

export default {
  isImage,
};
