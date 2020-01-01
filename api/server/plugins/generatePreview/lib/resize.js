const boom = require('boom');
const fs = require('fs');
const sharp = require('sharp');

const existsMod = require('../../exists/lib/exists');
const utils = require('../../utils');

async function transformImages(originalPath) {
  const dimensions = utils.config.get('resizeDimensions.preview');
  const originalMimeType = utils.file.mimeType(originalPath);

  if (originalMimeType !== 'image/jpeg') {
    return boom.badRequest(`Transform supports JPEG images, not (${originalMimeType})`);
  }

  return await sharp(originalPath)
    .rotate() // auto-orient based on the EXIF Orientation tag
    .resize(dimensions.width, dimensions.height)
    .toFile('dan.png', (err, info) => info);
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
