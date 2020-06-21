const resizer = require('./resize');
const validation = require('../../../lib/validation');

const handler = async (request) => {
  try {
    const sourcePath = request.payload.image_path;

    const out = await resizer.resize(sourcePath);
    return out;
  } catch (error) {
    return error;
  }
};

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/generate',
    options: {
      handler,
      tags: ['api', 'jpg', 'resize', 'generator', 'thumbnail'],
      validate: {
        payload: {
          image_path: validation.sourceFolder,
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
