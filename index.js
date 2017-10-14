/* global __dirname, require */

const Hapi = require('hapi');
const hapiReactViews = require('hapi-react-views');
const notifier = require('node-notifier');

require('tuxharness');

const config = require('./config.json');
const log = require('./plugins/log/index');
const plugins = require('./lib/plugins');

const { port } = config;
const logger = log.createLogger('server');
const server = new Hapi.Server();

server.connection({ port });
server.register(plugins, (error) => {
  if (error) {
    logger.panic(`Web server failed to initialize ${error.message}`);
    return;
  }

  server.start();
  logger.operational(`Server running at ${server.info.uri}`);
  notifier.notify({
    icon: `${__dirname}/favicon.ico`,
    title: 'Server event',
    message: `Running at ${server.info.uri}`
  });
});

server.views({
  defaultExtension: 'jsx',
  engines: {
    jsx: hapiReactViews
  },
  isCached: true,
  path: './',
  partialsPath: './',
  relativeTo: __dirname
});
