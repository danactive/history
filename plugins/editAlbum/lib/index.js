/* global __dirname, require */
const joi = require('joi');

const gallery = require('../../gallery/lib/gallery');
const routes = require('../../../lib/routes');

const handler = (request, reply) => {
  const outResponse = routes.curryJsonOrView({
    reply,
    isRaw: request.query.raw,
    viewPath: 'plugins/editAlbum/components/page.jsx',
    formatJson: (json) => {
      const context = { galleries: json };
      context.state = `window.state = ${JSON.stringify(context)};`;

      return context;
    }
  });

  gallery.getGalleries()
    .then(outResponse);
};

const validation = {
  raw: joi.boolean().truthy('true').falsy('false').default(false)
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
          raw: validation.raw
        }
      }
    }
  });

  server.route(routes.staticRoute({ urlSegment: 'album', pluginName: 'editAlbum' }));

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/assets/bundle.js',
    handler: {
      file: 'plugins/editAlbum/public/assets/bundle.js'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'edit-album',
  version: '0.2.0'
};
