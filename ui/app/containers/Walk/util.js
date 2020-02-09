const config = require('../../../../config.json');

function areImages(file) {
  return (file.mediumType === 'image' && config.supportedFileTypes.photo.includes(file.ext.toLowerCase()));
}

export default {
  areImages,
};
