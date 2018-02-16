/* global require */
const path = require('path');

const gallery = require('./gallery');

const staticGalleryFolder = (server, handler) => {
  server.route({
    method: 'GET',
    path: '/static/gallery-{gallery}/{param*}',
    options: {
      tags: ['static'],
      handler
    }
  });
};

const register = server => new Promise(async (resolve) => {
  server.route({
    method: 'GET',
    path: '/static/xslt/gallery.xslt',
    options: {
      tags: ['static'],
      handler: {
        file: {
          path: path.join(__dirname, '../../../../', 'public/xslt/gallery.xslt')
        }
      }
    }
  });

  try {
    await gallery.getGalleries();
    const handleRoute = {
      directory: {
        path: request => path.join(__dirname, '../../../../', `public/galleries/gallery-${request.params.gallery}`)
      }
    };
    resolve(staticGalleryFolder(server, handleRoute));
  } catch (error) {
    resolve(staticGalleryFolder(server, () => error));
  }
});

const plugin = {
  register,
  name: 'gallery',
  version: '0.2.0'
};

module.exports = { plugin };
