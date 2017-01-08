const async = require('async');
const boom = require('boom');
const fs = require('fs');
const path = require('path');

const exists = require('../../exists/lib/exists');
const utils = require('../../utils/lib');

/**
Reassign associated filename based on file without extension

@method reassignAssociated
@param {string[]} [absoluteFolderFilenames] Filenames that contains the raw camera photo files with absolute path
@param {string} [futureFile] Future file (without extension) of renamed new name based on date
@return {Promise} associated filenames with path
**/
function reassignAssociated(absoluteFolderFilenames, futureFile) {
  return new Promise((resolve) => {
    resolve(absoluteFolderFilenames.map((filename) => {
      const fileParts = path.parse(filename);

      return path.join(fileParts.dir, futureFile + fileParts.ext);
    }));
  });
}
exports.reassignAssociated = reassignAssociated;

/**
Viewing files in a browser should exclude source files

@method supportedBrowserMedia
@param {string} filename Filename path
@return {Promise} publicly viewable file
**/
function supportedBrowserMedia(filename) {
  return new Promise((resolve) => {
    const findType = utils.file.type(filename);
    const matchingTypes = utils.config.get('supportedFileTypes.photo')
      .concat(utils.config.get('supportedFileTypes.video'));
    resolve(matchingTypes.find(supportedType => supportedType === findType));
  });
}
exports.supportedBrowserMedia = supportedBrowserMedia;

/**
Renamed file paths

@method renamePaths
@param {string} sourceFolder Folder that contains the raw camera photo files
@param {string[]} filenames Current filenames (file and extension) of raw camera photo files
@param {string[]} futureFilenames Future filenames (file and extension) of renamed camera photo files
@param {object} [options] Additional optional options
@param {bool} options.renameAssociated Find matching files with different extensions, then rename them
@return {Promise}
**/
function renamePaths(sourceFolder, filenames, futureFilenames, options = {}) {
  return new Promise((resolve, reject) => {
    const renamedFilenames = [];
    const q = async.queue((rename, next) => {
      function renameFile() {
        fs.rename(rename.oldName, rename.newName, (error) => {
          if (error) {
            reject(boom.wrap(error));
          }

          if (supportedBrowserMedia(rename.newName)) {
            renamedFilenames.push(rename.newName);
          }

          next();
        });
      }

      exists.pathExists(rename.oldName)
        .then(renameFile)
        .catch((error) => {
          reject(boom.wrap(error));
        });
    }, 2);

    {
      const fullPath = path.resolve(__dirname, '../../../', sourceFolder);

      const transformFilenames = (pair, cb) => {
        if (options.renameAssociated) {
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
          return reject(error);
        }

        if (Array.isArray(transformedPairs)) {
          transformedPairs.forEach((pair) => {
            q.push(pair);
          });
        } else {
          q.push(transformedPairs);
        }

        return undefined;
      });
    }

    // assign a callback
    q.drain = () => resolve(renamedFilenames);
  });
}
exports.renamePaths = renamePaths;
