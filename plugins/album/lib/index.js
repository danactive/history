/* global __dirname, require */
const joi = require('joi');

const json = require('./json');

const handler = (request, reply) => {
  const albumStem = request.query.album_stem;
  const gallery = request.query.gallery;
  const raw = request.query.raw;

  json.getAlbum(gallery, albumStem)
    .then(response => (raw ? reply(response) : reply.view('plugins/album/views/album.jsx', response)))
    .catch(error => reply(error));
};

const validation = {
  albumStem: joi.string().required(),
  gallery: joi.string().required().example('demo'),
  raw: joi.boolean(),
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/album',
    config: {
      handler,
      tags: ['api', 'plugin', 'v0'],
      validate: {
        query: {
          album_stem: validation.albumStem,
          gallery: validation.gallery,
          raw: validation.raw,
        },
      },
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-album',
  version: '0.1.0',
};
