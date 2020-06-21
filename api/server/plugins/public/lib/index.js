const path = require('path');

const staticRouteFavicon = () => ({
  method: 'GET',
  path: '/favicon.ico',
  handler: {
    file: {
      confine: false,
      path: path.join(__dirname, '../../../../../public/favicon.ico'),
    },
  },
});

const staticRoutePublic = () => ({
  method: 'GET',
  path: '/public/{path*}',
  config: {
    description: 'Static assets in /public folder',
    tags: ['static'],
    handler: {
      directory: {
        path: path.join(__dirname, '../../../../../public'),
        listing: true,
        index: false,
        redirectToSlash: true,
      },
    },
  },
});

const register = (server) => {
  server.route(staticRouteFavicon());
  server.route(staticRoutePublic());
};

const plugin = {
  register,
  name: 'public',
  version: '0.4.0',
};

module.exports = { plugin };
