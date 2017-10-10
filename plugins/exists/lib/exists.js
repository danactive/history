const boom = require('boom');
const fs = require('fs');
const path = require('path');

const utils = require('../../utils');

const MODULE_NAME = 'pathExists';

/*
Verify if a path exists on the file system

@method pathExists
@param {string} verifyPath relative/absolute path (file or folder) on the file system
@returns {Promise}
*/
function pathExists(verifyPath) {
  return new Promise((resolve, reject) => {
    if (verifyPath === undefined || verifyPath === null) {
      reject(boom.notFound(`${MODULE_NAME} module: File system path is missing (${verifyPath})`));
    }

    const verifiedPath = utils.file.safePublicPath(verifyPath);

    fs.stat(verifiedPath, (error, type) => {
      if (error) {
        const pathType = path.isAbsolute(verifyPath) ? 'absolute' : 'relative';

        return reject(boom.notFound(`${MODULE_NAME} module: File system path is ${pathType} and not found due to error (${error})`));
      }

      if (type.isFile() || type.isDirectory()) {
        return resolve(verifiedPath);
      }

      return reject(boom.notFound('File failed'));
    });
  });
}
exports.pathExists = pathExists;
