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

const curryJsonOrView = ({ formatJson, isRaw, reply, viewPath }) =>
  json => ((isRaw) ? reply(formatJson(json)) : reply.view(viewPath, formatJson(json)));

module.exports = { curryJsonOrView, staticRoute };
