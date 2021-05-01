const fs = require('fs');

const fsPromises = fs.promises;

async function getGalleries() {
  try {
    const hasPrefix = (content) => content.isDirectory();
    const namesOnly = (content) => content.name;

    const contents = await fsPromises.readdir('../public/galleries', { withFileTypes: true });

    const galleries = contents.filter(hasPrefix).map(namesOnly);

    return galleries;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getGalleries,
};
