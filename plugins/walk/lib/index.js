/* global require */
const routes = require('../../../lib/routes');
const files = require('./files');

const handler = (request, reply) => {
  const outResponse = routes.createFormatReply({
    reply,
    isRaw: request.query.raw,
    viewPath: 'plugins/walk/components/page.jsx'
  });
  const outError = routes.createErrorReply(reply);

  files.listFiles(request.query.path)
    .then(outResponse)
    .catch(outError);
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/admin/walk-path',
    config: {
      handler,
      tags: ['api', 'plugin']
    }
  });

  server.route(routes.staticRoute({ pluginName: 'walk', urlSegment: 'walk' }));

  server.route({
    method: 'GET',
    path: '/walk/static/bundle.js',
    config: {
      tags: ['static']
    },
    handler: {
      file: 'plugins/walk/public/assets/bundle.js'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'history-walk',
  version: '0.2.0'
};
