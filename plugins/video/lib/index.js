/* global require */
const joi = require('joi');

const handler = (request, reply) => reply.view('plugins/video/components/page.jsx', { video: request.query });

const validation = {
  sources: joi.string(),
  w: joi.number(),
  h: joi.number(),
  gallery: joi.string()
};

exports.register = (server, options, next) => {
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

  next();
};

exports.register.attributes = {
  name: 'video',
  version: '0.1.1'
};
