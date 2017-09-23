/* global __dirname, require */
const json = require('./json');
const routes = require('../../../lib/routes');
const validation = require('../../../lib/validation');

const handler = (request, reply) => {
  const isRaw = request.query.raw;
  const viewPath = 'plugins/album/components/page.jsx';

  const outResponse = routes.createFormatReply({ isRaw, reply, viewPath });
  const outError = routes.createErrorReply(reply);

  json.getAlbum(request.query.gallery, request.query.album_stem)
    .then(outResponse)
    .catch(outError);
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
          raw: validation.raw
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/static/{path*}',
    config: {
      description: 'Static assets like JS, CSS, images files',
      handler: {
        directory: {
          path: 'plugins/album/public',
          listing: true,
          index: false,
          redirectToSlash: true
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/static/utils.js',
    config: {
      description: 'Utility script',
      handler: {
        file: 'plugins/utils/public/utils.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      tags: ['jQuery'],
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/bundle.js',
    config: {
      handler: {
        file: 'plugins/album/public/assets/bundle.js'
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'history-view-album',
  version: '0.3.0'
};
