
/* global require */

const handler = (request, reply) => reply.view('plugins/admin/views/page.jsx');

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      handler,
      description: 'Administration pages'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'history-admin',
  version: '0.1.0'
};
