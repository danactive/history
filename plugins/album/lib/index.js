/* global __dirname, require */
const joi = require('joi');

const json = require('./json');

const handler = (request, reply) => {
  const albumStem = request.query.album_stem;
  const gallery = request.query.gallery;
  const raw = request.query.raw;

  json.getAlbum(gallery, albumStem)
    .then(response => (raw ? reply(response) : reply.view('plugins/album/views/page.jsx', response)))
    .catch(error => reply(error));
};

const validation = {
  albumStem: joi.string().required(),
  gallery: joi.string().required().example('demo'),
  raw: joi.boolean().truthy('true').falsy('false').default(false),
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/album',
    config: {
      handler,
      tags: ['api', 'plugin'],
      validate: {
        query: {
          album_stem: validation.albumStem,
          gallery: validation.gallery,
          raw: validation.raw,
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/{path*}',
    config: {
      description: 'Static assets like JS, CSS, images files',
      tags: ['v0'],
      handler: {
        directory: {
          path: 'plugins/album/public',
          listing: true,
          index: false,
          redirectToSlash: true,
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/utils.js',
    config: {
      description: 'Utility script',
      tags: ['v0'],
      handler: {
        file: 'plugins/utils/public/utils.js',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      tags: ['jQuery'],
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/bundle.js',
    config: {
      handler: {
        file: 'plugins/album/public/assets/bundle.js',
      },
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-view-album',
  version: '0.3.0',
};
