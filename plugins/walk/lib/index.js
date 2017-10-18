/* global require */
const routes = require('../../../lib/routes');
const files = require('./files');

const handler = ({ query: { path, raw: isRaw } }, reply) => {
  const viewPath = 'plugins/walk/components/page.jsx';
  const handleResponse = routes.createFormatReply({ reply, isRaw, viewPath });
  const handleError = routes.createErrorReply(reply);

  files.listFiles(path)
    .then(handleResponse)
    .catch(handleError);
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/admin/walk-path',
    config: {
      handler,
      tags: ['api', 'react']
    }
  });

  server.route(routes.staticRoute({ pluginName: 'walk', urlSegment: 'walk' }));

  server.route(routes.staticRouteUtils({ urlSegment: 'walk' }));

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
  name: 'walk',
  version: '0.3.1'
};
