const boom = require('boom');
const gm = require('gm');
const path = require('path');

const existsMod = require('../../exists/lib');
const utils = require('../../utils/lib');

/**
 Resize single photo into originals, photos, thumbs folder

 @method resize
 @param {string} sourcePath path to image file
 **/
function resize(sourcePath) {
  return new Promise((resolve, reject) => {
    const originalPath = path.resolve(__dirname, '../../../', sourcePath);

    function transformImages() {
      const photoDims = utils.config.get('resizeDimensions.photo');
      const thumbDims = utils.config.get('resizeDimensions.thumb');
      const originalMimeType = utils.file.getMimeType(originalPath);

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
              errors.push(`Original orientation write error: ${errOrient}`);
            }

            function possibleCompletion() {
              callbackCount += 1;
              if (callbackCount === callbackTotal) {
                resolve({
                  meta: {
                    error: {
                      count: errors.length,
                      message: errors.join('; '),
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
                  errors.push(`Photo resize write error: ${errResize}`);
                }
                possibleCompletion();
              });

            gm(stdout)
              .resize(thumbDims.width, thumbDims.height, '!')
              .noProfile()
              .write(thumbPath, (errResize) => {
                if (errResize) {
                  errors.push(`Thumbnail resize write error: ${errResize}`);
                }
                possibleCompletion();
              });
          });
      } else {
        reject(boom.badRequest(`Transform supports JPEG images, not (${originalMimeType})`));
      }
    }

    existsMod.pathExists(originalPath)
      .then(transformImages)
      .catch(error => reject(boom.wrap(error)));
  });
}

module.exports.resize = resize;
