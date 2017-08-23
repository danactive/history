const appRoot = require('app-root-path');
const boom = require('boom');
const dotProp = require('dot-prop');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

const config = require('../../../config.json');

module.exports.config = {
  get: filepath => dotProp.get(config, filepath)
};

function customMime(extension) {
  if (['raw', 'arw'].includes(extension)) {
    return 'image/raw';
  }

  if (['m2ts', 'mts'].includes(extension)) {
    return 'video/mp2t';
  }

  const photoTypes = config.supportedFileTypes.photo.concat(config.rawFileTypes.photo);
  if (photoTypes.includes(extension)) {
    return 'image';
  }

  const videoTypes = config.supportedFileTypes.video.concat(config.rawFileTypes.video);
  if (videoTypes.includes(extension)) {
    return 'video';
  }

  return false;
}

const fileMethods = {
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
  mediumType: (extension) => {
    if (!extension) {
      return false;
    }

    if (typeof extension !== 'string') {
      return false;
    }

    if (extension.indexOf('/') === -1) {
      if (['image', 'photo'].includes(extension)) {
        return 'image';
      }

      if (['video'].includes(extension)) {
        return 'video';
      }

      return false;
    }

    return extension.split('/')[0];
  },
  absolutePath: filepath => (path.isAbsolute(filepath) ? filepath : appRoot.resolve(filepath)),
  photoPath: filepath => filepath && filepath.replace('thumbs', 'photos')
};

fileMethods.videoToThumbsPath = (filepath = null, gallery = null) => {
  if (filepath === null || gallery === null) {
    return undefined;
  }

  const year = filepath.substr(0, 4);
  const firstVideoSource = filepath.split(',')[0];
  const type = fileMethods.type(firstVideoSource);
  const file = firstVideoSource.substr(0, firstVideoSource.indexOf(type) - 1);
  return `/static/gallery-${gallery}/media/thumbs/${year}/${file}.jpg`;
};

/*
 Find associated path and filename based on file without extension

 @method glob
 @param {string} sourceFolder Folder that contains the files
 @param {string} pattern glob file extension pattern to find matching filenames
 @param {object} [options]
 @param {bool} [options.ignoreExtension] Apply pattern without file extension
 @return {Promise} array of string associated filenames with absolute path
*/
fileMethods.glob = (sourceFolder, pattern, options = {}) => new Promise((resolve, reject) => {
  let absolutePath = fileMethods.absolutePath(sourceFolder);
  if (options.ignoreExtension === true) {
    absolutePath = absolutePath.replace(`.${fileMethods.type(absolutePath)}`, '');
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

module.exports.file = fileMethods;
