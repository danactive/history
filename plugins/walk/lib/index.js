/* global require */
const routes = require('../../../lib/routes');
const files = require('./files');
const validation = require('../../../lib/validation');

const handler = ({ query: { path, raw: isRaw } }, reply) => new Promise((resolve) => {
  const viewPath = 'plugins/walk/components/page.jsx';
  const handleResponse = json => ((isRaw) ? resolve(json) : reply.view(viewPath, json));
  const handleError = routes.createErrorReply(resolve);

  files.listFiles(path)
    .then(handleResponse)
    .catch(handleError);
});

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/admin/walk-path',
    options: {
      handler,
      tags: ['api', 'react'],
      validate: {
        query: {
          path: validation.sourceFolder,
          raw: validation.raw
        }
      }
    }
  });

  server.route(routes.staticRoute({ pluginName: 'walk', urlSegment: 'walk' }));

  server.route(routes.staticRouteUtils({ urlSegment: 'walk' }));

  server.route({
    method: 'GET',
    path: '/walk/static/bundle.js',
    options: {
      tags: ['static']
    },
    handler: {
      file: 'plugins/walk/public/assets/bundle.js'
    }
  });
};

const plugin = {
  register,
  name: 'walk',
  version: '0.4.0'
};

module.exports = { plugin };
