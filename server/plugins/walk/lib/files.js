const globCallback = require('glob');
const path = require('path');
const { promisify } = require('util');

const config = require('../../../../config.json');
const utils = require('../../utils');

const glob = promisify(globCallback);

async function listFiles(destPath = '') {
  try {
    const publicPath = await utils.file.safePublicPath('/');
    const globPath = path.join(publicPath, destPath);

    if (!globPath.startsWith(publicPath)) {
      throw new URIError('Invalid system path');
    }

    const files = await glob(`${globPath}/*`);

    const webPaths = files.map((file) => {
      const out = {};
      out.ext = utils.file.type(file); // case-insensitive
      out.name = path.basename(file, `.${out.ext}`);
      out.filename = (out.ext === '') ? out.name : `${out.name}.${out.ext}`;
      out.path = file.replace(globPath, destPath);

      const mediumType = utils.file.mediumType(utils.file.mimeType(out.ext));
      out.mediumType = mediumType || 'folder';

      return out;
    });

    return { files: webPaths, destPath };
  } catch (error) {
    throw error;
  }
}

function areImages(file) {
  return (file.mediumType === 'image' && config.supportedFileTypes.photo.includes(file.ext.toLowerCase()));
}

module.exports = {
  areImages,
  listFiles
};
