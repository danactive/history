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
          path: `plugins/${pluginName}/public`,
          listing: true,
          index: false,
          redirectToSlash: true
        }
      }
    }
  };
}

function routeToUtils({ urlSegment }) {
  return {
    method: 'GET',
    path: `/${urlSegment}/static/utils.js`,
    config: {
      description: 'Utility script',
      handler: {
        file: 'plugins/utils/public/utils.js'
      }
    }
  };
}

const createFormatReply = ({
  formatJson = x => x, isRaw = false, reply, viewPath = ''
}) =>
  json => ((isRaw) ? reply(formatJson(json)) : reply.view(viewPath, formatJson(json)));

const createErrorReply = reply => (error) => {
  const boomError = (error.isBoom) ? error : boom.boomify(error);

  reply(boomError);
};

module.exports = {
  createErrorReply,
  createFormatReply,
  routeToUtils,
  staticRoute
};
