const dotProp = require('dot-prop');

const resizeMod = require('./resize');
const validation = require('../../../lib/validation');

async function handler(request, h) {
  const sourcePath = request.payload.source_path;

  try {
    const response = await resizeMod.resize(sourcePath);
    if (dotProp.get(response, 'meta.error.count', 0) > 0) {
      return h.response(response.meta.error).code(500);
    }

    // TODO danactive add property of photo and thumb output directories
    return { resize: true };
  } catch (error) {
    return error;
  }
}

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/resize',
    options: {
      handler,
      tags: ['api'],
      validate: {
        payload: {
          source_path: validation.sourceFolder,
        },
      },
    },
  });
};

const plugin = {
  register,
  name: 'resize',
  version: '1.0.0',
};

module.exports = { plugin };
