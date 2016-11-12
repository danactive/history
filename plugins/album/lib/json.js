const boom = require('boom');
const camelCase = require('camelcase');
const clone = require('clone');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

function caption(item) {
  const presentable = (...values) => values.every(value => value !== undefined && value !== '');
  if (presentable(item.photoLoc, item.photoCity, item.photoDesc)) {
    return `${item.photoLoc} (${item.photoCity}): ${item.photoDesc}`;
  }
  if (presentable(item.photoLoc, item.photoCity)) {
    return `${item.photoLoc} (${item.photoCity})`;
  }
  if (presentable(item.photoLoc, item.photoDesc)) {
    return `${item.photoLoc}: ${item.photoDesc}`;
  }
  if (presentable(item.photoCity, item.photoDesc)) {
    return `${item.photoCity}: ${item.photoDesc}`;
  }
  if (presentable(item.photoLoc)) {
    return item.photoLoc;
  }
  if (presentable(item.photoCity)) {
    return item.photoCity;
  }

  return item.photoDesc;
}
module.exports.caption = caption;

function thumbPath(item) {
  return `/static/gallery-dan/media/thumbs/2016/${item.filename}`;
}


function templatePrepare(result = {}) {
  if (!result.album || !result.album.item) {
    return result;
  }

  const output = clone(result);

  output.album.items = output.album.item.map((item) => {
    item.caption = caption(item);
    item.path = thumbPath(item);
    return item;
  });
  delete output.album.item;

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

      resolve(templatePrepare(result));
    });
  });
});
