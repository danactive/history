const routes = require('../../../lib/routes');
const filesServer = require('../../../../../next/src/lib/filesystems');
const validation = require('../../../lib/validation');

const routeWalkPath = {
  method: 'GET',
  path: '/admin/walk-path',
  options: {
    handler: async function handler({ query: { path } }) {
      try {
        const { files } = await filesServer.get(path);
        return { files };
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
