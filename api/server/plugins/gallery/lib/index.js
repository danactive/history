const gallery = require('../../../../../app/src/galleries');

async function register(server) {
  server.route({
    method: 'GET',
    path: '/galleries',
    options: {
      tags: ['api'],
      handler: async () => {
        const { body: { galleries } } = await gallery.get();
        return { galleries };
      },
    },
  });
}

const plugin = {
  register,
  name: 'gallery',
  version: '0.5.0',
};

module.exports = { plugin };
