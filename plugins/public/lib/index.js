const routes = require('../../../lib/routes');

exports.register = (server, options, next) => {
  server.route(routes.staticRoute({ urlSegment: 'public', pluginName: '../' }));

  next();
};

exports.register.attributes = {
  name: 'public',
  version: '0.1.0'
};
