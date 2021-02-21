const gallery = require('../../../../../app/pages/api/galleryList/gallery');

async function register(server) {
  server.route({
    method: 'GET',
    path: '/galleryList',
    options: {
      tags: ['api'],
      handler: async () => ({ galleries: await gallery.getGalleries() }),
    },
  });
}

const plugin = {
  register,
  name: 'gallery',
  version: '0.4.0',
};

module.exports = { plugin };
