'use strict';
/*
*     #######
*     #       #    # #  ####  #####  ####
*     #        #  #  # #        #   #
*     #####     ##   #  ####    #    ####
*     #         ##   #      #   #        #
*     #        #  #  # #    #   #   #    #
*     ####### #    # #  ####    #    ####
*
*/
/**
Verify if a path exists on the file system

@method folderExists
@param {string} path absolute path (file or folder) on the file system
@param {promise}
**/
function folderExists(verifyPath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const appRoot = require('app-root-path');
    let verifiedPath = verifyPath;

    if (verifyPath.charAt(0) === '.' || verifyPath.charAt(0) === '/') { // convert relative to absolute
      verifiedPath = appRoot.resolve(verifyPath);
    }

    fs.stat(verifiedPath, (error, type) => {
      const boom = require('boom');
      if (error) {
        return reject(boom.notFound(`File system path is missing ${error}`));
      }
      if (type.isFile() || type.isDirectory()) {
        return resolve(verifiedPath);
      }
    });
  });
}
exports.folderExists = folderExists;
