const appRoot = require('app-root-path');
const boom = require('boom');
const dotenv = require('dotenv');
const dotProp = require('dot-prop');
const glob = require('glob');
const mime = require('mime-types');
const path = require('path');

const configFile = require('../../../../../config.json');

const config = {
  get: (dotpath) => dotProp.get(configFile, dotpath),
};

const env = {
  load: () => {
    dotenv.config({ path: path.join(__dirname, '../../../../../.env') });
    process.env.HISTORY_ENV_LOADED = true;
    process.env.HISTORY_ENV_TESTED = 1;
  },
  get: (key) => {
    if (!process.env.HISTORY_ENV_LOADED) {
      env.load();
    }

    if (process.env[key]) {
      return JSON.parse(process.env[key]);
    }

    return null;
  },
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function customMime(rawExtension) {
  const extension = (rawExtension) ? rawExtension.toLowerCase() : null;

  if (['raw', 'arw'].includes(extension)) {
    return 'image/raw';
  }

  if (['m2ts', 'mts'].includes(extension)) {
    return 'video/mp2t';
  }

  const photoTypes = configFile.supportedFileTypes.photo.concat(configFile.rawFileTypes.photo);
  if (photoTypes.includes(extension)) {
    return 'image';
  }

  const videoTypes = configFile.supportedFileTypes.video.concat(configFile.rawFileTypes.video);
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
      return path.parse(filepath).name.substr(1);
    }

    return path.extname(filepath).substr(1);
  },
  mimeType: (extension) => customMime(extension) || mime.lookup(extension),
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
  absolutePath: (filepath) => (path.isAbsolute(filepath) ? filepath : appRoot.resolve(filepath)),
  photoPath: (filepath) => filepath && filepath.replace('thumbs', 'photos'),
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
    if (error) {
      reject(boom.boomify(error));
    }

    resolve(files);
  });
});

/*
 Construct a file system path from the history public folder

 @method safePublicPath
 @param {string} relative or absolute path from /history/public folder; root absolute paths are rejected
 @return {Promise} string
*/
fileMethods.safePublicPath = (rawDestinationPath) => {
  try {
    const normalizedDestinationPath = path.normalize(rawDestinationPath);
    const publicPath = path.normalize(path.join(__dirname, '../../../../../public'));
    const isRawInPublic = normalizedDestinationPath.startsWith(publicPath);
    const safeDestinationPath = (isRawInPublic) ? normalizedDestinationPath : path.join(publicPath, normalizedDestinationPath);

    if (!safeDestinationPath.startsWith(publicPath)) {
      throw boom.forbidden(`Restrict to public file system (${safeDestinationPath}); publicPath(${publicPath})`);
    }

    return safeDestinationPath;
  } catch (error) {
    if (error.name === 'TypeError') { // path core module error
      throw boom.notAcceptable('Invalid file system path');
    }

    throw boom.boomify(error);
  }
};

module.exports = {
  env, config, clone, file: fileMethods,
};
