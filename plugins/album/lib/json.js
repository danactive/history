const boom = require('boom');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

module.exports.getAlbum = (gallery, albumStem) => new Promise((resolve, reject) => {
  const parser = new xml2js.Parser();
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
