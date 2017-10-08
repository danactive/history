/* global __dirname, require */
const gallery = require('../../gallery/lib/gallery');
const routes = require('../../../lib/routes');
const validation = require('../../../lib/validation');

const handler = ({ query: { raw: isRaw } }, reply) => {
  const formatJson = (json) => {
    const context = { galleries: json };
    context.state = `window.state = ${JSON.stringify(context)};`;

    return context;
  };
  const viewPath = 'plugins/editAlbum/components/page.jsx';

  const handleResponse = routes.createFormatReply({
    isRaw, formatJson, reply, viewPath
  });
  const handleError = routes.createErrorReply(reply);

  gallery.getGalleries()
    .then(handleResponse)
    .catch(handleError);
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/album',
    config: {
      handler,
      tags: ['api', 'plugin'],
      validate: {
        query: {
          raw: validation.raw
        }
      }
    }
  });

  server.route(routes.staticRoute({ urlSegment: 'album', pluginName: 'editAlbum' }));

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/assets/bundle.js',
    handler: {
      file: 'plugins/editAlbum/public/assets/bundle.js'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'edit-album',
  version: '0.2.0'
};
