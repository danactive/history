
/* global require */

const handler = (request, reply) => reply.view('plugins/admin/components/page.jsx');

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      tags: ['static'],
      handler,
      description: 'Administration pages'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'admin',
  version: '0.1.1'
};
