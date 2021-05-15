const boom = require('boom');
const fs = require('fs');
const sharp = require('sharp');

const { previewFolderName } = require('../../../../../config.json');
const existsMod = require('../../../../../app/src/exists');
const utils = require('../../utils');

async function transformImages(originalPath) {
  const dimensions = utils.config.get('resizeDimensions.preview');
  const originalMimeType = utils.file.mimeType(originalPath);
  const paths = originalPath.split('/');
  const filename = paths.pop();
  const sourcePath = paths.join('/');

  if (originalMimeType !== 'image/jpeg') {
    return boom.badRequest(`Transform supports JPEG images, not (${originalMimeType})`);
  }

  const outFolder = `${sourcePath}/${previewFolderName}`;
  const outPath = `${outFolder}/${filename}`;
  try {
    await fs.promises.mkdir(outFolder, { recursive: true }); // ensure folder exists without overwriting
    const meta = await sharp(originalPath)
      .rotate() // auto-orient based on the EXIF Orientation tag
      .resize(dimensions.width, dimensions.height)
      .toFile(outPath);

    return { meta, path: outPath };
  } catch (error) {
    return { error: error.message, path: outPath };
  }
}

/**
 * Resize single photo into preview
 * @param sourcePath
 * @returns {Promise<unknown>}
 */
const resize = async (sourcePath) => {
  try {
    const absolutePath = await existsMod.pathExists(sourcePath);
    const out = await transformImages(absolutePath);
    return out;
  } catch (error) {
    return boom.boomify(error);
  }
};

module.exports.resize = resize;
