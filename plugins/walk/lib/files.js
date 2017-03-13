const glob = require('glob');
const path = require('path');

const utils = require('../../utils/lib');

function listFiles(currentPath = '') {
  return new Promise((resolve, reject) => {
    const globPath = path.join(__dirname, '../../../public', currentPath); // todo security, prevent traversing up tree
    glob(`${globPath}/*`, (error, files) => {
      if (error) {
        reject(error);
        return;
      }

      const webPaths = files.map((file) => {
        const out = {};
        out.ext = utils.file.type(file); // case-insensitive
        out.name = path.basename(file, `.${out.ext}`);
        out.path = file.replace(globPath, currentPath);

        const type = utils.file.mediumType(out.ext);
        out.type = type || 'folder';

        return out;
      });

      resolve({ files: webPaths, currentPath });
    });
  });
}

module.exports = { listFiles };
