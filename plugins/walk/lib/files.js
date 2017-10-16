const glob = require('glob');
const path = require('path');

const utils = require('../../utils');

function listFiles(destPath = '') {
  return new Promise((resolve, reject) => {
    const publicPath = path.join(__dirname, '../../../public');
    const globPath = path.join(publicPath, destPath);

    if (!globPath.startsWith(publicPath)) {
      reject(new URIError('Invalid system path'));
      return;
    }

    glob(`${globPath}/*`, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

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

      resolve({ files: webPaths, destPath });
    });
  });
}

module.exports = { listFiles };
