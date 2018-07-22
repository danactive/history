/* global __dirname, require */

const gallery = require('../../gallery/lib/gallery');

const handler = (request, reply) => new Promise(async (resolve) => {
  const isRaw = request.query.raw;
  const viewPath = 'plugins/home/components/page.jsx';
  const handleResponse = json => ((isRaw) ? resolve(json) : resolve(reply.view(viewPath, json)));

  const galleries = await gallery.getGalleries();

  handleResponse({ galleries });
});

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    options: {
      description: 'Home landing page',
      handler,
      tags: ['react'],
    },
  });
};

const plugin = {
  register,
  name: 'home',
  version: '0.2.0',
};

module.exports = { plugin };
