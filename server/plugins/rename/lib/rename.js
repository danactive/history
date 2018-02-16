const async = require('async');
const Boom = require('boom');
const fs = require('fs');
const path = require('path');

const exists = require('../../exists/lib/exists');
const utils = require('../../utils');

/*
Reassign associated filename based on file without extension

@method reassignAssociated
@param {string[]} [absoluteFolderFilenames] Filenames that contains the raw camera photo files with absolute path
@param {string} [futureFile] Future file (without extension) of renamed new name based on date
@return {Promise} associated filenames with path
*/
function reassignAssociated(absoluteFolderFilenames, futureFile) {
  return new Promise((resolve) => {
    resolve(absoluteFolderFilenames.map((filename) => {
      const fileParts = path.parse(filename);

      return path.join(fileParts.dir, futureFile + fileParts.ext);
    }));
  });
}

/*
Renamed file paths

@method renamePaths
@param {string} sourceFolder Folder that contains the raw camera photo files
@param {string[]} filenames Current filenames (file and extension) of raw camera photo files
@param {string[]} futureFilenames Future filenames (file and extension) of renamed camera photo files
@param {object} [options] Additional optional options
@param {bool} options.renameAssociated Find matching files with different extensions, then rename them
@return {Promise}
*/
function renamePaths(sourceFolder, filenames, futureFilenames, { preview, renameAssociated } = {}) {
  return new Promise(async (resolve, reject) => {
    const renamedFilenames = [];
    const q = async.queue((rename, next) => {
      function renameFile() {
        if (preview && renameAssociated) {
          renamedFilenames.push(rename.newName);
          next();
        } else {
          fs.rename(rename.oldName, rename.newName, (error) => {
            if (error) {
              reject(Boom.boomify(error));
            }

            renamedFilenames.push(rename.newName);

            next();
          });
        }
      }

      exists.pathExists(rename.oldName)
        .then(renameFile)
        .catch(error => reject(Boom.boomify(error)));
    }, 2);

    {
      const fullPath = await utils.file.safePublicPath(sourceFolder)
        .catch(error => reject(Boom.boomify(error)));

      const transformFilenames = (pair, cb) => {
        if (renameAssociated) {
          let oldNames;

          utils.file.glob(path.join(fullPath, pair.current), '.*', { ignoreExtension: true })
            .then((associatedFilenames) => {
              oldNames = associatedFilenames;
              const endWithoutExt = pair.future.length - path.extname(pair.future).length;
              const futureFile = pair.future.substr(0, endWithoutExt); // strip extension

              return reassignAssociated(associatedFilenames, futureFile);
            })
            .then((reassignFilenames) => {
              const reassignPairs = oldNames.map((oldName, index) => ({ oldName, newName: reassignFilenames[index] }));

              cb(null, reassignPairs);
            });
        } else {
          const oldName = path.join(fullPath, pair.current);
          const newName = path.join(fullPath, pair.future);

          cb(null, { oldName, newName });
        }
      };

      const filenamePairs = filenames.map((filename, index) => ({ current: filename, future: futureFilenames[index] }));

      async.map(filenamePairs, transformFilenames, (error, transformedPairs) => {
        if (error) {
          reject(error);
          return;
        }

        if (Array.isArray(transformedPairs)) {
          q.push([...[].concat(...transformedPairs)]);
        } else {
          q.push(transformedPairs);
        }
      });
    }

    // assign a callback
    q.drain = () => resolve(renamedFilenames);
  });
}

module.exports = {
  reassignAssociated,
  renamePaths
};
