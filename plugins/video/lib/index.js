/* global require */
const joi = require('joi');

const handler = (request, reply) => reply.view('plugins/video/components/page.jsx', { video: request.query });

const validation = {
  sources: joi.string(),
  w: joi.number(),
  h: joi.number(),
  gallery: joi.string()
};

const register = (server) => {
  server.route({
    method: 'GET',
    path: '/video',
    config: {
      handler,
      description: 'Watch HTML5 videos',
      tags: ['react'],
      validate: {
        query: {
          sources: validation.sources,
          w: validation.w,
          h: validation.h,
          gallery: validation.gallery
        }
      }
    }
  });
};

const plugin = {
  register,
  name: 'video',
  version: '0.2.0'
};

module.exports = { plugin };
