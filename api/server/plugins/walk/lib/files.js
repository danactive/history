const globCallback = require('glob');
const path = require('path');
const { promisify } = require('util');

const utils = require('../../utils');

const glob = promisify(globCallback);

async function listFiles(destPath = '') {
  const publicPath = utils.file.safePublicPath('/');
  const globPath = path.join(publicPath, destPath);

  if (!globPath.startsWith(publicPath)) {
    throw new URIError('Invalid system path');
  }

  const files = await glob(decodeURI(`${globPath}/*`));

  const webPaths = files.map((file) => {
    const out = {};
    out.ext = utils.file.type(file); // case-insensitive
    out.name = path.basename(file, `.${out.ext}`);
    out.filename = (out.ext === '') ? out.name : `${out.name}.${out.ext}`;
    out.path = file.replace(globPath, destPath);
    out.mediumType = utils.file.mediumType(utils.file.mimeType(out.ext));

    return out;
  });

  return { files: webPaths, destPath };
}

module.exports = {
  listFiles,
};
