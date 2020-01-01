const resizeMod = require('./resize');
const validation = require('../../../lib/validation');
const utils = require('../../utils');

const uiPort = utils.config.get('uiPort');

const handler = request => new Promise((resolve) => {
  const sourcePath = request.payload.source_path;

  resizeMod.resize(sourcePath)
    .then(() => resolve({ resize: true }))
    .catch(resolve);
});

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/resize',
    options: {
      handler,
      cors: {
        origin: [`http://localhost:${uiPort}`],
      },
      tags: ['api'],
      validate: {
        payload: {
          source_path: validation.sourceFolder,
        },
      },
      response: {
        schema: {
          resize: validation.resize,
        },
      },
    },
  });
};

const plugin = {
  register,
  name: 'resize',
  version: '0.3.0',
};

module.exports = { plugin };
