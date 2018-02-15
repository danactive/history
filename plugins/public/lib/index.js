const routes = require('../../../lib/routes');

const register = (server) => {
  server.route(routes.staticRoute({ urlSegment: 'public', pluginName: '../' }));
};

const plugin = {
  register,
  name: 'public',
  version: '0.2.0'
};

module.exports = { plugin };
