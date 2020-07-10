const fs = require('fs');

const utils = require('../../utils');

const fsPromises = fs.promises;

async function getGalleries() {
  try {
    const hasPrefix = (content) => content.isDirectory();
    const namesOnly = (content) => content.name;

    const galleriesPath = utils.file.safePublicPath('/galleries');
    const contents = await fsPromises.readdir(galleriesPath, { withFileTypes: true });

    const galleries = contents.filter(hasPrefix).map(namesOnly);

    return galleries;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getGalleries,
};
