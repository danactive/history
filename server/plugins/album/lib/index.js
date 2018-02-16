/* global __dirname, require */
const Dropbox = require('dropbox');

const { createTransform } = require('./dropbox');
const jsonAlbum = require('./json');
const log = require('../../log');
const routes = require('../../../lib/routes');
const utils = require('../../utils');
const validation = require('../../../lib/validation');

const logger = log.createLogger('Route: View Album');

function applyDropbox(response) {
  const accessToken = utils.env.get('HISTORY_DROPBOX_ACCESS_TOKEN');

  if (!accessToken) {
    logger.panic('applyDropbox error (Missing Dropbox API accessToken)');

    return response;
  }

  const transform = createTransform(new Dropbox({ accessToken }));

  return transform(response, 'thumbPath');
}

const handler = (request, reply) => new Promise((resolve) => {
  const {
    album_stem: albumStem,
    cloud,
    gallery,
    raw: isRaw = false
  } = request.query;
  const viewPath = 'plugins/album/components/page.jsx';

  const applyCloud = response => ((cloud === 'dropbox') ? applyDropbox(response) : response);
  const handleResponse = json => ((isRaw) ? resolve(json) : resolve(reply.view(viewPath, json)));
  const handleError = routes.createErrorReply(resolve);

  jsonAlbum.getAlbum(gallery, albumStem)
    .then(applyCloud)
    .then(handleResponse)
    .catch(handleError);
});

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/album',
    options: {
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

  server.route(routes.staticRouteUtils({ urlSegment: 'album' }));

  server.route(routes.staticRouteJquery({ urlSegment: 'album' }));
};

const plugin = {
  register,
  name: 'view-album',
  version: '0.6.0'
};

module.exports = { plugin };
