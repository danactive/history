/* global require */
const path = require('path');

const gallery = require('./gallery');

const staticGalleryFolder = (server, handler) => {
  server.route({
    method: 'GET',
    path: '/static/gallery-{gallery}/{param*}',
    options: {
      tags: ['static'],
      handler,
    },
  });
};

const routeTable = [];

routeTable.push({
  method: 'GET',
  path: '/gallery/list',
  options: {
    cors: { origin: ['http://localhost:3000'] },
    tags: ['api'],
    handler: async () => ({ galleries: await gallery.getGalleries() }),
  },
});

routeTable.push({
  method: 'GET',
  path: '/static/xslt/gallery.xslt',
  options: {
    tags: ['static'],
    handler: {
      file: {
        confine: false,
        path: path.join(__dirname, '../../../../../', 'public/xslt/gallery.xslt'),
      },
    },
  },
});

const register = server => new Promise(async (resolve) => {
  routeTable.forEach(routeDefiniation => server.route(routeDefiniation));

  try {
    await gallery.getGalleries();
    const handleRoute = {
      directory: {
        path: request => path.join(__dirname, '../../../../../', `public/galleries/gallery-${request.params.gallery}`),
        listing: true,
      },
    };
    resolve(staticGalleryFolder(server, handleRoute));
  } catch (error) {
    resolve(staticGalleryFolder(server, () => error));
  }
});

const plugin = {
  register,
  name: 'gallery',
  version: '0.4.0',
};

module.exports = { plugin };
