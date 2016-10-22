const dotProp = require('dot-prop');
const mime = require('mime-types');

const configJson = require('../../../config.json');

module.exports.config = {
  get: path => dotProp.get(configJson, path),
};

module.exports.file = {
  getType: (path) => {
    if (path.lastIndexOf('.') >= 0) {
      return path.substr(path.lastIndexOf('.') + 1).toLowerCase();
    }
    return '';
  },
  getMimeType: type => mime.lookup(type),
};
