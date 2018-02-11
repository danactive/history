/* global __dirname, require */

const gallery = require('../../gallery/lib/gallery');

const handler = (request, reply) => {
  gallery.getGalleries().then(galleries => reply.view('plugins/home/components/page.jsx', { galleries }));
};

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      description: 'Home landing page',
      handler,
      tags: ['react']
    }
  });
};

const plugin = {
  register,
  name: 'home',
  version: '0.2.0'
};

module.exports = { plugin };
