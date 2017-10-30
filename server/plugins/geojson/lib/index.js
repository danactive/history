/* global __dirname, require */
const json = require('./json');
const validation = require('../../../lib/validation');

const handler = (request, reply) => {
  const {
    album_stem: albumStem,
    gallery
  } = request.query;

  json.dataToGeojson(gallery, albumStem)
    .then(geojsonData => reply(geojsonData))
    .catch(error => reply(error));
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      description: 'GeoJSON for any album in any gallery',
      handler,
      tags: ['api'],
      validate: {
        query: {
          album_stem: validation.albumStem,
          gallery: validation.gallery
        }
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'geojson',
  version: '0.1.1'
};
