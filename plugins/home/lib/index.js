/* global __dirname, require */

const gallery = require('./gallery');

const handler = (request, reply) => {
  gallery.getGalleries().then(galleries => reply.view('plugins/home/views/page.jsx', { galleries }));
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      description: 'Home landing page',
      handler,
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-home',
  version: '0.1.0',
};
