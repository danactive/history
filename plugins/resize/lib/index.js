/* global require */
const joi = require('joi');

const resizeMod = require('./resize');

const handler = (request, reply) => {
  const sourcePath = request.payload.source_path;

  resizeMod.resize(sourcePath)
    .then(() => reply({ resize: true }))
    .catch(error => reply(error));
};

const validation = {
  sourcePath: joi.string(),
};

exports.register = (server, options, next) => {
  server.route({
    method: 'POST',
    path: '/resize',
    config: {
      handler,
      tags: ['api', 'plugin', 'v0'],
      validate: {
        payload: {
          source_path: validation.sourcePath,
        },
      },
      response: {
        schema: {
          resize: joi.boolean(),
        },
      },
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-resize',
  version: '0.2.0',
};
