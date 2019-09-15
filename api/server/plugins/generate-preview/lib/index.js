const resizeMod = require('./resize');
const validation = require('../../../lib/validation');
const utils = require('../../utils');

const uiPort = utils.config.get('uiPort');

const handler = (request) => new Promise((reply) => {
  const sourcePath = request.payload.source_path;

  resizeMod.resize(sourcePath)
    .then(() => reply({ resize: true }))
    .catch(reply);
});

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/generate-preview',
    options: {
      handler,
      cors: {
        origin: [`http://localhost:${uiPort}`],
      },
      tags: ['api', 'jpg', 'resize', 'generator', 'thumbnail'],
      validate: {
        payload: {
          source_path: validation.sourceFolder,
        },
      },
      // response: {
      //   schema: {
      //     resize: validation.resize,
      //   },
      // },
    },
  });
};

const plugin = {
  register,
  name: 'generate-preview',
  version: '0.1.0',
};

module.exports = { plugin };
