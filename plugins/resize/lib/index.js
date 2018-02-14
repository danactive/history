const resizeMod = require('./resize');
const validation = require('../../../lib/validation');

const handler = request => new Promise((reply) => {
  const sourcePath = request.payload.source_path;

  resizeMod.resize(sourcePath)
    .then(() => reply({ resize: true }))
    .catch(reply);
});

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/resize',
    options: {
      handler,
      tags: ['api'],
      validate: {
        payload: {
          source_path: validation.sourceFolder
        }
      },
      response: {
        schema: {
          resize: validation.resize
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
