
/* global require */

const handler = (request, reply) => reply.view('plugins/admin/components/page.jsx');

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    config: {
      tags: ['static'],
      handler,
      description: 'Administration pages'
    }
  });
};

const plugin = {
  register,
  name: 'admin',
  version: '0.2.0'
};

module.exports = { plugin };
