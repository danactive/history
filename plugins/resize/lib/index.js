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
  sourcePath: joi.string()
};

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/resize',
    config: {
      handler,
      tags: ['api'],
      validate: {
        payload: {
          source_path: validation.sourcePath
        }
      },
      response: {
        schema: {
          resize: joi.boolean().truthy('true').falsy('false')
        }
      }
    }
  });
};

const plugin = {
  register,
  name: 'resize',
  version: '0.3.0'
};

module.exports = { plugin };
