/* global require */
const joi = require('joi');

const json = require('./json');

const handler = (request, reply) => {
  const gallery = request.query.gallery;
  const albumStem = request.query.album_stem;

  json.getAlbum(gallery, albumStem)
    .then(response => reply(response))
    .catch(error => reply(error));
};

const validation = {
  gallery: joi.string().required().example('demo'),
  albumStem: joi.string().required(),
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
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album-view',
    handler: (request, reply) => reply.view('plugins/album/views/home.jsx'),
  });

  next();
};

exports.register.attributes = {
  name: 'history-album',
  version: '0.1.0',
};
