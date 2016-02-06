'use strict';
/**
Renamed file paths

@method renamePaths
@param {string} [sourceFolder] Folder that contains the raw camera photo files
@param {string[]} [filenames] Current filenames (file and extension) of raw camera photo files
@param {string[]} [futureFilenames] Future filenames (file and extension) of renamed camera photo files
@return {json}
**/
function renamePaths(sourceFolder, filenames, futureFilenames) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const exists = require('../../exists/lib');
    const boom = require('boom');
    const q = require('async').queue((rename, next) => {
      exists.folderExists(rename.oldName)
        .then(() => {
          fs.rename(rename.oldName, rename.newName, (error) => {
            if (error) {
              reject(boom.wrap(error));
            }
            next();
          });
        })
        .catch((error) => {
          reject(boom.wrap(error));
        });
    }, 2);

    // assign a callback
    q.drain = () => resolve(true);

    const path = require('path');
    const appRoot = require('app-root-path');
    filenames.forEach((filename, index) => {
      const oldName = appRoot.resolve(path.join('../../', sourceFolder, filename));
      const newName = appRoot.resolve(path.join('../../', sourceFolder, futureFilenames[index]));
      q.push({ oldName, newName });
    });
  });
}
exports.renamePaths = renamePaths;
