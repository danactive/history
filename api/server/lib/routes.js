const boom = require('boom');
const path = require('path');

function staticRoute({ pluginName, urlSegment }) {
  return {
    method: 'GET',
    path: `/${urlSegment}/static/{path*}`,
    config: {
      description: 'Static assets like JS, CSS, images files',
      tags: ['static'],
      handler: {
        directory: {
          path: path.join(__dirname, `../plugins/${pluginName}/public`),
          listing: true,
          index: false,
          redirectToSlash: true,
        },
      },
    },
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
        file: path.join(__dirname, '../plugins/utils/public/lib/jquery/dist/jquery.min.js'),
      },
    },
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
        file: path.join(__dirname, '../plugins/utils/public/utils.js'),
      },
    },
  };
}

const createErrorReply = (reply) => (error) => {
  const boomError = (error.isBoom) ? error : boom.boomify(error);

  reply(boomError);
};

function wrapError(error) {
  return (error.isBoom) ? error : boom.boomify(error);
}

module.exports = {
  createErrorReply,
  staticRoute,
  staticRouteJquery,
  staticRouteUtils,
  wrapError,
};
