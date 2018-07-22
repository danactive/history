const boom = require('boom');
const camelCase = require('camelcase');
const clone = require('clone');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const utils = require('../../utils');
const validation = require('../../../lib/validation');

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


function caption(item) {
  if (item.type === 'video') {
    return `Video: ${item.thumbCaption}`;
  }

  return item.thumbCaption;
}


function jpgFilenameInsensitive(filename) {
  const currentExt = utils.file.type(filename);
  const futureExt = (currentExt.toLowerCase() === 'jpg') ? currentExt : 'jpg';
  const imageFilename = filename.replace(currentExt, futureExt);

  return imageFilename;
}

function getThumbPath(item, gallery) {
  if (!item || !item.filename) {
    return undefined;
  }

  const filename = (typeof item.filename === 'string') ? item.filename : item.filename[0];
  const imageFilename = jpgFilenameInsensitive(filename);
  const year = imageFilename.indexOf('-') >= 0 && imageFilename.split('-')[0];
  return `/static/gallery-${gallery}/media/thumbs/${year}/${imageFilename}`;
}


function getVideoPath(item, gallery) {
  if (!item || !item.filename) {
    return undefined;
  }

  const filename = (typeof item.filename === 'string') ? item.filename : item.filename.join(',');
  const dimensions = (item.size) ? { width: item.size.w, height: item.size.h } : { width: '', height: '' };
  return `/view/video?sources=${filename}&w=${dimensions.width}&h=${dimensions.height}&gallery=${gallery}`;
}


function templatePrepare(result = {}) {
  if (!result.album || !result.album.item || !result.album.meta) {
    return result;
  }

  const { gallery } = result.album.meta;
  const output = clone(result);
  delete output.album.item;

  output.album.items = result.album.item.map((_item) => {
    const item = _item;
    item.caption = item.thumbCaption;
    if (item.geo) {
      item.geo.lat = parseFloat(item.geo.lat);
      item.geo.lon = parseFloat(item.geo.lon);
    } else {
      item.geo = {
        lat: null,
        lon: null,
      };
    }

    const thumbPath = getThumbPath(item, gallery);
    const photoPath = utils.file.photoPath(thumbPath);
    const videoPath = getVideoPath(item, gallery);
    const enhancements = {
      thumbCaption: caption(item),
      title: title(item),
      thumbPath,
      mediaPath: (item.type === 'video') ? videoPath : photoPath,
    };

    return Object.assign(item, enhancements);
  });

  return output;
}


function safePath(name, value) {
  const restriction = () => `Valid ${name} contains Alpha-Numeric characters, is at least 1 character long but less than 25,
    and may contain any special characters including dash (-) or underscore (_)`;

  if (!value || validation[name].validate(value).error) {
    return boom.notAcceptable(restriction());
  }

  if (name === 'albumStem') {
    return `album_${value}.xml`;
  }

  return `gallery-${value}`;
}


function ensureSafePath(name, value, reject) {
  const partialPath = safePath(name, value);

  if (partialPath.isBoom === true) {
    return reject(partialPath);
  }

  return partialPath;
}


const getAlbum = (gallery, albumStem) => new Promise((resolve, reject) => {
  const options = { explicitArray: false, normalizeTags: true, tagNameProcessors: [name => camelCase(name)] };
  const parser = new xml2js.Parser(options);

  const xmlPath = path.join(
    __dirname,
    '../../../../',
    'public/galleries',
    ensureSafePath('gallery', gallery, reject),
    'xml',
    ensureSafePath('albumStem', albumStem, reject),
  );

  fs.readFile(xmlPath, (readError, fileData) => {
    if (readError) {
      reject(boom.notFound('XML album path is not found', readError));
      return;
    }

    parser.parseString(fileData, (parseError, result) => {
      if (parseError) {
        reject(boom.forbidden('XML format is invalid'));
        return;
      }

      resolve(templatePrepare(result));
    });
  });
});

module.exports = {
  caption,
  jpgFilenameInsensitive,
  getAlbum,
  getThumbPath,
  getVideoPath,
  safePath,
  title,
  templatePrepare,
};
