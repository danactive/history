/* global require */
const routes = require('../../../lib/routes');

exports.register = (server, options, next) => {
  server.route(routes.staticRoute({ urlSegment: 'video', pluginName: 'exploreVideo' }));

  next();
};

exports.register.attributes = {
  name: 'explore-video',
  version: '0.1.0'
};
