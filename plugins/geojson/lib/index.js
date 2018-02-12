/* global __dirname, require */
const json = require('./json');
const validation = require('../../../lib/validation');

const handler = request => new Promise((reply) => {
  const {
    album_stem: albumStem,
    gallery
  } = request.query;

  json.dataToGeojson(gallery, albumStem)
    .then(geojsonData => reply(geojsonData))
    .catch(error => reply(error));
});

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    options: {
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
};

const plugin = {
  register,
  name: 'geojson',
  version: '0.2.0'
};

module.exports = { plugin };
