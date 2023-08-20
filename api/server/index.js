const boom = require('boom');
const hapi = require('@hapi/hapi');
const hapiReactViews = require('hapi-react-views');
const joi = require('@hapi/joi');
const notifier = require('node-notifier');

require('tuxharness');

const config = require('../../config.json');
const log = require('./plugins/log');
const plugins = require('./lib/plugins');

const { apiPort: port, uiPort } = config;
const logger = log.createLogger('server');

const server = hapi.Server({
  port,
  routes: {
    cors: {
      origin: [`http://localhost:${uiPort}`, 'https://history.domaindesign.ca'],
    },
    validate: {
      failAction: async (request, h, err) => {
        if (process.env.NODE_ENV === 'production') {
          // In prod, log a limited error message and throw the default Bad Request error.
          console.error('ValidationError:', err.message);
          throw boom.badRequest('Invalid request payload input');
        } else {
          // During development, log and respond with the full error.
          console.error(err);
          throw err;
        }
      },
    },
  },
});
server.validator(joi);

function announceStart() {
  logger.operational(`Server running at ${server.info.uri}`);
  notifier.notify({
    icon: `${__dirname}/favicon.ico`,
    title: 'Server event',
    message: `Running at ${server.info.uri}`,
  });
}

function getViewsConfig() {
  return {
    defaultExtension: 'jsx',
    engines: {
      jsx: hapiReactViews,
    },
    isCached: true,
    path: './',
    partialsPath: './',
    relativeTo: __dirname,
  };
}

async function startServer() {
  try {
    await server.register(plugins);
    server.views(getViewsConfig());
    await server.start();
    announceStart();
  } catch (error) {
    logger.panic(`Web server failed to initialize ${error.message}`);
  }
}

startServer();

module.exports = {
  stopServer: async () => {
    await server.stop();
  },
};
