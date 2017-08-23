const glob = require('glob');
const path = require('path');

const utils = require('../../utils/lib');

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
        out.path = file.replace(globPath, destPath);

        const type = utils.file.mediumType(out.ext);
        out.type = type || 'folder';

        return out;
      });

      resolve({ files: webPaths, destPath });
    });
  });
}

module.exports = { listFiles };
