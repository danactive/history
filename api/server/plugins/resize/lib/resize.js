const boom = require('boom');
const gm = require('gm');

const existsMod = require('../../exists/lib/exists');
const utils = require('../../utils');

/*
 Resize single photo into originals, photos, thumbs folder

 @method resize
 @param {string} sourcePath path to image file
*/
function resize(sourcePath) {
  return new Promise((resolve, reject) => {
    function transformImages(originalPath) {
      const photoDims = utils.config.get('resizeDimensions.photo');
      const thumbDims = utils.config.get('resizeDimensions.thumb');
      const originalMimeType = utils.file.mimeType(originalPath);

      if (originalMimeType === 'image/jpeg') {
        gm(originalPath)
          .autoOrient()
          .stream((errOrient, stdout) => { // stderr is third param
            let callbackCount = 0;
            const callbackTotal = 2;
            const errors = [];
            const photoPath = originalPath.replace('originals', 'photos');
            const thumbPath = originalPath.replace('originals', 'thumbs');

            if (errOrient) {
              errors.push(`Resize original: ${errOrient.message}`);
            }

            function possibleCompletion() {
              callbackCount += 1;
              if (callbackCount === callbackTotal) {
                resolve({
                  meta: {
                    error: {
                      count: errors.length,
                      message: errors,
                    },
                  },
                  payload: {
                    paths: {
                      original: originalPath,
                      photo: photoPath,
                      thumb: thumbPath,
                    },
                  },
                });
              }
            }

            gm(stdout)
              .resize(photoDims.width, photoDims.height)
              .write(photoPath, (errResize) => {
                if (errResize) {
                  errors.push(`Resize photo: ${errResize.message}`);
                }
                possibleCompletion();
              });

            gm(stdout)
              .resize(thumbDims.width, thumbDims.height, '!')
              .noProfile()
              .write(thumbPath, (errResize) => {
                if (errResize) {
                  errors.push(`Resize thumbnail:  ${errResize.message}`);
                }
                possibleCompletion();
              });
          });
      } else {
        reject(boom.badRequest(`Transform supports JPEG images, not (${originalMimeType})`));
      }
    }

    let safePath;
    try {
      safePath = utils.file.safePublicPath(sourcePath);
    } catch (error) {
      reject(boom.boomify(error));
    }
    existsMod.pathExists(safePath)
      .then(transformImages)
      .catch(error => reject(boom.boomify(error)));
  });
}

module.exports.resize = resize;
