const register = (server) => {
  server.route({
    method: 'GET',
    path: '/{path*}',
    config: {
      description: 'Static assets in /public folder',
      tags: ['static'],
      handler: {
        directory: {
          path: '../public',
          redirectToSlash: true,
          listing: true,
        },
      },
    },
  });
};

const plugin = {
  register,
  name: 'public',
  version: '0.5.0',
};

module.exports = { plugin };
