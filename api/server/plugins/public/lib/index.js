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

const register = (server) => {
  server.route(staticRouteFavicon());
};

const plugin = {
  register,
  name: 'public',
  version: '0.3.0',
};

module.exports = { plugin };
