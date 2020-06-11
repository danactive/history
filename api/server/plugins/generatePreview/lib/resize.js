const boom = require('boom');
const sharp = require('sharp');

const existsMod = require('../../exists/lib/exists');
const utils = require('../../utils');

async function transformImages(originalPath) {
  const dimensions = utils.config.get('resizeDimensions.preview');
  const originalMimeType = utils.file.mimeType(originalPath);

  if (originalMimeType !== 'image/jpeg') {
    return boom.badRequest(`Transform supports JPEG images, not (${originalMimeType})`);
  }

  const image = await sharp(originalPath)
    .rotate() // auto-orient based on the EXIF Orientation tag
    .resize(dimensions.width, dimensions.height)
    .toFile('output.png', (err, info) => info);

  return image;
}

/**
 * Resize single photo into preview
 * @param sourcePath
 * @returns {Promise<unknown>}
 */
const resize = async (sourcePath) => {
  try {
    const absolutePath = await existsMod.pathExists(sourcePath);
    return await transformImages(absolutePath);
  } catch (error) {
    return boom.boomify(error);
  }
};

module.exports.resize = resize;
