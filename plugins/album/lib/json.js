const boom = require('boom');
const camelCase = require('camelcase');
const clone = require('clone');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const utils = require('../../utils/lib');

function title(item) {
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
module.exports.title = title;

function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`;
  }

  return item.thumbCaption;
}
module.exports.caption = caption;

function thumbPath(item, gallery) {
  if (!item || !item.filename) {
    return undefined;
  }

  let filename = (typeof item.filename === 'string') ? item.filename : item.filename[0];
  filename = filename.replace(utils.file.type(filename), 'jpg');
  const year = filename.indexOf('-') >= 0 && filename.split('-')[0];
  return `/static/gallery-${gallery}/media/thumbs/${year}/${filename}`;
}
module.exports.thumbPath = thumbPath;


function templatePrepare(result = {}) {
  if (!result.album || !result.album.item || !result.album.meta) {
    return result;
  }

  const gallery = result.album.meta.gallery;
  const output = clone(result);

  output.album.items = output.album.item.map((item) => {
    item.caption = caption(item);
    item.title = title(item);
    item.path = thumbPath(item, gallery);
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
