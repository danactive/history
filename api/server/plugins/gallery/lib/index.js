const gallery = require('../../../../../app/src/lib/galleries');

async function register(server) {
  server.route({
    method: 'GET',
    path: '/galleries',
    options: {
      tags: ['api'],
      handler: async () => {
        const { galleries } = await gallery.get();
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
