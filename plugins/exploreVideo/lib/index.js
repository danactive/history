/* global require */
const routes = require('../../../lib/routes');
const validation = require('../../../lib/validation');

const handler = (request, reply) => {
  const isRaw = request.query.raw;
  const formatJson = (json) => {
    const context = { galleries: json };
    context.state = `window.state = ${JSON.stringify(context)};`;

    return context;
  };
  const viewPath = 'plugins/exploreVideo/components/page.jsx';

  const handleResponse = json => ((isRaw) ? reply(formatJson(json)) : reply.view(viewPath, formatJson(json)));

  handleResponse({});
};

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    options: {
      handler,
      tags: ['react'],
      validate: {
        query: {
          geocode: validation.geocode,
          raw: validation.raw
        }
      }
    }
  });

  server.route(routes.staticRoute({ urlSegment: 'video', pluginName: 'exploreVideo' }));
};

const plugin = {
  register,
  name: 'explore-video',
  version: '0.4.0'
};

module.exports = { plugin };
