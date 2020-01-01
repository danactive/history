const boom = require('boom');
const gm = require('gm');

const validation = require('../../../lib/validation');
const existsMod = require('../../exists/lib/exists');
const utils = require('../../utils');

const uiPort = utils.config.get('uiPort');

const handler = async (request) => {
  try {
    const sourcePath = request.payload.source_path;
    const safePath = await utils.file.safePublicPath(sourcePath);
    const absolutePath = await existsMod.pathExists(safePath);
    return { absolutePath };
  } catch (error) {
    return boom.boomify(error);
  }
};

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
