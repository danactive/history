/* global __dirname, require */
const joi = require('joi');

const gallery = require('../../gallery/lib');

const handler = (request, reply) => {
  const raw = request.query.raw;
  const format = (galleries) => {
    const context = { galleries };
    context.state = `window.state = ${JSON.stringify(context)};`;

    return context;
  };

  gallery.getGalleries()
    .then(galleries => (raw ? reply(format(galleries)) : reply.view('plugins/editAlbum/views/page.jsx', format(galleries))));
};

const validation = {
  raw: joi.boolean().truthy('true').falsy('false').default(false),
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
          path: 'plugins/editAlbum/public',
          listing: true,
          index: false,
          redirectToSlash: true,
        },
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js',
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/album/assets/bundle.js',
    handler: {
      file: 'plugins/editAlbum/public/assets/bundle.js',
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-edit-album',
  version: '0.1.0',
};
