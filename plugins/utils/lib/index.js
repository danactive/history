const appRoot = require('app-root-path');
const boom = require('boom');
const dotProp = require('dot-prop');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

const configJson = require('../../../config.json');
// const logMod = require('../../log/lib');

// const log = logMod('util');

module.exports.config = {
  get: filepath => dotProp.get(configJson, filepath),
};

const file = {
  getType: (filepath) => {
    if (filepath.lastIndexOf('.') >= 0) {
      return filepath.substr(filepath.lastIndexOf('.') + 1).toLowerCase();
    }
    return '';
  },
  getMimeType: extension => mime.lookup(extension),
  absolutePath: filepath => (path.isAbsolute(filepath) ? filepath : appRoot.resolve(path.join('../', filepath))),
};

/**
 Find associated path and filename based on file without extension

 @method fileGlob
 @param {string} sourceFolder Folder that contains the files
 @param {string} pattern glob file extension pattern to find matching filenames
 @param {object} [options]
 @param {bool} [options.ignoreExtension] Apply pattern without file extension
 @return {Promise} array of string associated filenames with absolute path
 **/
file.glob = (sourceFolder, pattern, options = {}) => new Promise((resolve, reject) => {
  let absolutePath = file.absolutePath(sourceFolder);
  if (options.ignoreExtension === true) {
    absolutePath = absolutePath.replace(`.${file.getType(absolutePath)}`, '');
  } else {
    absolutePath = path.join(absolutePath, '/');
  }
  const find = `${absolutePath}${pattern}`;
  glob(find, (error, files) => {
    // log.debug(find);
    if (error) {
      reject(boom.wrap(error));
    }

    resolve(files);
  });
});

module.exports.file = file;
