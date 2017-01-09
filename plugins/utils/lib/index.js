const appRoot = require('app-root-path');
const boom = require('boom');
const dotProp = require('dot-prop');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

const configJson = require('../../../config.json');
// const logMod = require('../../log/lib/log');
const pkg = require('../../../package.json');

// const log = logMod('util');

module.exports.config = {
  get: filepath => dotProp.get(configJson, filepath),
};

function customMime(extension) {
  switch (extension) {
    case 'raw':
    case 'arw':
      return 'image/raw';
    case 'm2ts':
    case 'mts':
      return 'video/mp2t';
    default:
      return false;
  }
}

const file = {
  type: (filepath) => {
    if (!filepath) {
      return false;
    }

    if (filepath.lastIndexOf('.') === 0) {
      return path.parse(filepath).name.toLowerCase().substr(1);
    }

    return path.extname(filepath).toLowerCase().substr(1);
  },
  mimeType: extension => customMime(extension) || mime.lookup(extension),
  mediumType: extension => (typeof extension === 'string') && (extension.indexOf('/') > 0) && extension.split('/')[0],
  absolutePath: filepath => (path.isAbsolute(filepath) ? filepath : appRoot.resolve(filepath)),
  photoPath: filepath => filepath && filepath.replace('thumbs', 'photos'),
};

/**
 Find associated path and filename based on file without extension

 @method glob
 @param {string} sourceFolder Folder that contains the files
 @param {string} pattern glob file extension pattern to find matching filenames
 @param {object} [options]
 @param {bool} [options.ignoreExtension] Apply pattern without file extension
 @return {Promise} array of string associated filenames with absolute path
 **/
file.glob = (sourceFolder, pattern, options = {}) => new Promise((resolve, reject) => {
  let absolutePath = file.absolutePath(sourceFolder);
  if (options.ignoreExtension === true) {
    absolutePath = absolutePath.replace(`.${file.type(absolutePath)}`, '');
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

function platform() {
  switch (process.platform) {
    case 'win32':
      return 'windows';

    default:
      return process.platform;
  }
}
module.exports.platform = platform();

/**
 * Error handling for JSON output
 *
 * @method setError
 * @param {object} [error] Node.js create error object (may be Boom wrapped)
 * @param {string} [message] Description of error
 * @param {object} [data] Additional meta data of error
 * @return {object} Returns JSON of error details
 */
function setError(error, message, _data) {
  const hasError = (error !== undefined && error !== null);
  const out = {};
  const statusCode = 500;
  const data = _data || { message };

  if (hasError && error.meta && error.meta.error.isBoom) {
    return error;
  }

  const boomError = (hasError) ? boom.wrap(error, statusCode, message) : boom.create(statusCode, message, data);

  out.meta = {
    error: boomError,
    version: pkg.version,
  };

  return out;
}

module.exports.setError = setError;
