/* global __dirname, require */
const json = require('./json');
const routes = require('../../../lib/routes');
const transform = require('./dropbox').transform;
const validation = require('../../../lib/validation');

const handler = ({ query: { album_stem: albumStem, gallery, cloud, raw: isRaw } }, reply) => {
  const viewPath = 'plugins/album/components/page.jsx';

  const applyCloud = (response => ((cloud === 'dropbox') ? transform(response, 'thumbPath') : response));
  const outResponse = routes.createFormatReply({ isRaw, reply, viewPath });
  const outError = routes.createErrorReply(reply);

  json.getAlbum(gallery, albumStem)
    .then(applyCloud)
    .then(outResponse)
    .catch(outError);
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/album',
    config: {
      handler,
      tags: ['react'],
      validate: {
        query: {
          album_stem: validation.albumStem,
          cloud: validation.cloudProviders,
          gallery: validation.gallery,
          raw: validation.raw
        }
      }
    }
  });

  server.route(routes.staticRoute({ pluginName: 'album', urlSegment: 'album' }));

  server.route({
    method: 'GET',
    path: '/album/static/utils.js',
    config: {
      description: 'Utility script',
      handler: {
        file: 'plugins/utils/public/utils.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/static/jquery.js',
    config: {
      description: 'jQuery library',
      tags: ['jQuery'],
      handler: {
        file: 'plugins/utils/public/lib/jquery/dist/jquery.min.js'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/album/bundle.js',
    config: {
      handler: {
        file: 'plugins/album/public/assets/bundle.js'
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'view-album',
  version: '0.4.0'
};
