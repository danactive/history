const gallery = require('../../../../../app/pages/api/galleries/local');

async function register(server) {
  server.route({
    method: 'GET',
    path: '/galleries',
    options: {
      tags: ['api'],
      handler: async () => {
        const { body } = await gallery.get();
        return body;
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
