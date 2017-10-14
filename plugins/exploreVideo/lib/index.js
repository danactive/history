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

  const handleResponse = routes.createFormatReply({
    isRaw, formatJson, reply, viewPath
  });

  handleResponse({});
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
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

  next();
};

exports.register.attributes = {
  name: 'explore-video',
  version: '0.3.0'
};
