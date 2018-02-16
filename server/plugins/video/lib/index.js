const validation = require('../../../lib/validation');

const handler = (request, reply) => new Promise((resolve) => {
  const isRaw = request.query.raw;
  const viewPath = 'plugins/video/components/page.jsx';
  const handleResponse = json => ((isRaw) ? resolve(json) : resolve(reply.view(viewPath, json)));

  handleResponse({ video: request.query });
});

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/video',
    options: {
      handler,
      description: 'Watch HTML5 videos',
      tags: ['react'],
      validate: {
        query: {
          gallery: validation.gallery,
          w: validation.w,
          h: validation.h,
          raw: validation.raw,
          sources: validation.sources
        }
      }
    }
  });
};

const plugin = {
  register,
  name: 'video',
  version: '0.2.0'
};

module.exports = { plugin };
