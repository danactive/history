const fs = require('fs');

const fsPromises = fs.promises;

async function get(errorSchema) {
  try {
    const hasPrefix = (content) => content.isDirectory();
    const namesOnly = (content) => content.name;

    const contents = await fsPromises.readdir('../public/galleries', { withFileTypes: true });

    return { body: { galleries: contents.filter(hasPrefix).map(namesOnly) }, status: 200 };
  } catch {
    return { body: errorSchema('No galleries are found'), status: 404 };
  }
}

module.exports = {
  get,
};
