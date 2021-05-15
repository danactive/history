const routes = require('../../../lib/routes');
const files = require('../../../../../app/src/filesystem');
const validation = require('../../../lib/validation');

const routeWalkPath = {
  method: 'GET',
  path: '/admin/walk-path',
  options: {
    handler: async function handler({ query: { path } }) {
      try {
        const { body } = await files.get(path);
        return { files: body.files };
      } catch (e) {
        return routes.wrapError(e);
      }
    },
    tags: ['api'],
    validate: {
      query: {
        path: validation.sourceFolder,
      },
    },
  },
};

const register = (server) => {
  server.route(routeWalkPath);
};

const plugin = {
  register,
  name: 'walk',
  version: '0.4.0',
};

module.exports = { plugin };
