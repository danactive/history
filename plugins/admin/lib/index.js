const handler = (request, reply) => reply.view('plugins/admin/components/page.jsx');

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/',
    options: {
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
