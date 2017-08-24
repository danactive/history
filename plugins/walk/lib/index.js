/* global require */
const files = require('./files');

const curryJsonOrView = ({ isRaw, reply, viewPath }) => json => ((isRaw) ? reply(json) : reply.view(viewPath, json));

const handler = (request, reply) => {
  const outResponse = curryJsonOrView({
    reply,
    isRaw: request.query.raw,
    viewPath: 'plugins/walk/views/page.jsx'
  });
  const path = request.query.path;

  files.listFiles(path)
    .then(outResponse);
};

exports.register = (server, options, next) => {
  server.route({
    method: 'GET',
    path: '/admin/walk-path',
    config: {
      handler,
      tags: ['api', 'plugin']
    }
  });

  server.route({
    method: 'GET',
    path: '/walk/static/{path*}',
    config: {
      description: 'Static assets like JS, CSS, images files',
      tags: ['static'],
      handler: {
        directory: {
          path: 'plugins/walk/public',
          listing: true,
          index: false,
          redirectToSlash: true
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/walk/static/bundle.js',
    config: {
      tags: ['static']
    },
    handler: {
      file: 'plugins/walk/public/assets/bundle.js'
    }
  });

  next();
};

exports.register.attributes = {
  name: 'history-walk',
  version: '0.2.0'
};
