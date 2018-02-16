const boom = require('boom');

function staticRoute({ pluginName, urlSegment }) {
  return {
    method: 'GET',
    path: `/${urlSegment}/static/{path*}`,
    config: {
      description: 'Static assets like JS, CSS, images files',
      tags: ['static'],
      handler: {
        directory: {
          path: `server/plugins/${pluginName}/public`,
          listing: true,
          index: false,
          redirectToSlash: true
        }
      }
    }
  };
}

function staticRouteJquery({ urlSegment }) {
  return {
    method: 'GET',
    path: `/${urlSegment}/static/jquery.js`,
    config: {
      description: 'jQuery library',
      tags: ['static', 'jQuery'],
      handler: {
        file: 'server/plugins/utils/public/lib/jquery/dist/jquery.min.js'
      }
    }
  };
}

function staticRouteUtils({ urlSegment }) {
  return {
    method: 'GET',
    path: `/${urlSegment}/static/utils.js`,
    config: {
      description: 'Utility script',
      tags: ['static'],
      handler: {
        file: 'server/plugins/utils/public/utils.js'
      }
    }
  };
}

const createErrorReply = reply => (error) => {
  const boomError = (error.isBoom) ? error : boom.boomify(error);

  reply(boomError);
};

module.exports = {
  createErrorReply,
  staticRoute,
  staticRouteJquery,
  staticRouteUtils
};
