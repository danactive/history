const boom = require('boom');
const fs = require('fs');
const path = require('path');

const moduleName = 'pathExists';

/**
Verify if a path exists on the file system

@method pathExists
@param {string} verifyPath relative/absolute path (file or folder) on the file system
@returns {promise}
**/
function pathExists(verifyPath) {
  return new Promise((resolve, reject) => {
    if (verifyPath === undefined) {
      reject(boom.notFound(`${moduleName} module: File system path is missing (${verifyPath})`));
    }

    const verifiedPath = path.isAbsolute(verifyPath) ? verifyPath : path.resolve(__dirname, '../../../', verifyPath);

    fs.stat(verifiedPath, (error, type) => {
      if (error) {
        const pathType = path.isAbsolute(verifyPath) ? 'absolute' : 'relative';

        return reject(boom.notFound(`${moduleName} module: File system path is ${pathType} and not found
        due to error (${error})`));
      }

      if (type.isFile() || type.isDirectory()) {
        return resolve(verifiedPath);
      }

      return reject(boom.notFound('File failed'));
    });
  });
}
exports.pathExists = pathExists;
