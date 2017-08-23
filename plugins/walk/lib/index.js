/* global require */
const files = require('./files');

const handler = (request, reply) => {
  const raw = request.query.raw;
  const path = request.query.path;

  files.listFiles(path)
    .then(contents => ((raw) ? reply(contents) : reply.view('plugins/walk/views/page.jsx', contents)));
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

  next();
};

exports.register.attributes = {
  name: 'history-walk',
  version: '0.2.0'
};
