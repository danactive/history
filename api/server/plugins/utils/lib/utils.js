const boom = require('boom');
const dotenv = require('dotenv');
const dotProp = require('dot-prop');
const glob = require('glob');
const path = require('path');

const configFile = require('../../../../../config.json');
const utilsFactory = require('../../../../../app/pages/api/admin/filesystem/utils');

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

const fileMethods = utilsFactory();

fileMethods.videoToThumbsPath = (filepath = null, gallery = null) => {
  if (filepath === null || gallery === null) {
    return undefined;
  }

  const year = filepath.substr(0, 4);
  const firstVideoSource = filepath.split(',')[0];
  const type = fileMethods.type(firstVideoSource);
  const file = firstVideoSource.substr(0, firstVideoSource.indexOf(type) - 1);
  return `/galleries/${gallery}/media/thumbs/${year}/${file}.jpg`;
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

module.exports = {
  env, config, clone, file: fileMethods,
};
