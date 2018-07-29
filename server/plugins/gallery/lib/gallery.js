const fs = require('fs');
const { promisify } = require('util');

const utils = require('../../utils');

const readDir = promisify(fs.readdir);

async function galleriesContents() {
  const galleriesPath = await utils.file.safePublicPath('/galleries');
  const fsContents = await readDir(galleriesPath);
  return fsContents;
}

const getGalleries = () => new Promise((resolve, reject) => {
  const hasPrefix = filename => filename.startsWith('gallery-');
  const parseName = filename => filename.substr(8);

  galleriesContents()
    .then(filenames => resolve(filenames.filter(hasPrefix).map(parseName)))
    .catch(error => reject(error));
});

module.exports = {
  getGalleries,
};
