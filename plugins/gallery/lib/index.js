/* global require */
const path = require('path');

const gallery = require('./gallery');

const routeHandler = (error, server, galleries, next) => {
  let handler;
  if (error) {
    handler = (request, reply) => reply(error);
  } else {
    handler = {
      directory: {
        path: request => path.join(__dirname, '../../../', `public/galleries/gallery-${request.params.gallery}`)
      }
    };
  }

  server.route({
    method: 'GET',
    path: '/static/gallery-{gallery}/{param*}',
    config: {
      handler
    }
  });

  next();
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/static/xslt/gallery.xslt',
    config: {
      handler: {
        file: {
          path: path.join(__dirname, '../../../', 'public/xslt/gallery.xslt')
        }
      }
    }
  });

  const noError = undefined;
  gallery.getGalleries()
    .then(galleries => routeHandler(noError, server, galleries, next))
    .catch(error => routeHandler(error, server, [], next));
};

exports.register.attributes = {
  name: 'history-gallery',
  version: '0.1.0'
};
