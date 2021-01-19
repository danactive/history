const dotProp = require('dot-prop');

const resizeMod = require('./resize');
const validation = require('../../../lib/validation');

async function handler(request, h) {
  const sourcePath = request.payload.source_path;

  try {
    const result = await resizeMod.resize(sourcePath);
    if (dotProp.get(result, 'meta.error.count', 0) > 0) {
      return h.response(result.meta.error).code(500);
    }

    console.log('Resize photo images to ', result.payload.paths.photos);
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
