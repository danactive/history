'use strict';
/**
Verify if a path exists on the file system

@method pathExists
@param {string} path relative/absolute path (file or folder) on the file system
@param {promise}
**/
function pathExists(verifyPath) {
  return new Promise((resolve, reject) => {
    const boom = require('boom');
    if (verifyPath === undefined) {
      reject(boom.notFound(`pathExists module: is missing a path to verify`));
    }
    const verifiedPath = require('path').isAbsolute(verifyPath) ?
      verifyPath : require('app-root-path').resolve(verifyPath);

    require('fs').stat(verifiedPath, (error, type) => {
      if (error) {
        return reject(boom.notFound(`pathExists module: File system path is missing ${error}`));
      }
      if (type.isFile() || type.isDirectory()) {
        return resolve(verifiedPath);
      }
    });
  });
}
exports.pathExists = pathExists;
