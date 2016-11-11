const boom = require('boom');
const camelCase = require('camelcase');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

function caption(item) {
  const presentable = (...values) => values.every(value => value !== undefined && value !== '');
  if (presentable(item.location, item.city, item.description)) {
    return `${item.location} (${item.city}): ${item.description}`;
  }
  if (presentable(item.location, item.city)) {
    return `${item.location} (${item.city})`;
  }
  if (presentable(item.location, item.description)) {
    return `${item.location}: ${item.description}`;
  }
  if (presentable(item.city, item.description)) {
    return `${item.city}: ${item.description}`;
  }
  if (presentable(item.location)) {
    return item.location;
  }
  if (presentable(item.city)) {
    return item.city;
  }

  return item.description;
}
module.exports.caption = caption;


function templatePrepare(result = {}) {
  const output = {};
  if (result.meta) {
    output.meta = result.meta;
  }

  if (result.items) {
    output.items = result.items.map((i) => {
      const item = i;
      item.caption = caption(item);
      return item;
    });
  }

  return output;
}
module.exports.templatePrepare = templatePrepare;


module.exports.getAlbum = (gallery, albumStem) => new Promise((resolve, reject) => {
  const options = { explicitArray: false, normalizeTags: true, tagNameProcessors: [name => camelCase(name)] };
  const parser = new xml2js.Parser(options);
  const xmlPath = path.join(__dirname, '../../../', `gallery-${gallery}`, 'xml', `album_${albumStem}.xml`);

  fs.readFile(xmlPath, (readError, fileData) => {
    if (readError) {
      reject(boom.notFound('XML album path is not found', readError));
    }

    parser.parseString(fileData, (parseError, result) => {
      if (parseError) {
        reject(boom.forbidden('XML format is invalid'));
      }

      resolve(result);
    });
  });
});
