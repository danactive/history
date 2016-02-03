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
    fs.stat(verifyPath, (error, type) => {
      if (error) {
        return reject({
          path: verifyPath,
          verified: false,
        });
      }
      if (type.isFile() || type.isDirectory()) {
        return resolve({
          path: verifyPath,
          verified: true,
        });
      }
    });
  });
}
exports.folderExists = folderExists;
