/* global __dirname, require */
const json = require('./json');
const validation = require('../../../lib/validation');

const handler = (request, reply) => {
  const albumStem = request.query.album_stem;
  const gallery = request.query.gallery;

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
      tags: ['api', 'plugin'],
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
  name: 'history-geojson',
  version: '0.1.0'
};
