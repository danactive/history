'use strict';

exports.register = (server, options, next) => {
  const joi = require('joi');

  server.route({
    method: 'POST',
    path: '/rename',
    config: {
      handler: (request, reply) => {
        const exists = require('../../exists/lib');
        const rename = require('./rename');
        const filenames = require('./filenames');

        exists.folderExists(request.query.source_folder)
          .then(filenames.getFutureFilenames(request.query.prefix, request.query.filenames.length))
          .then((futureFilenames) => {
            rename.renamePaths();
            reply(futureFilenames);
          })
          .catch(() => {
            reply(`Source Folder does not exist in the file system (${request.query.source_folder})`);
          });
      },
      tags: ['api'],
      validate: {
        query: {
          filenames: joi.array().items(joi.string().regex(/^[-\w^&'@{}[\],$=!#().%+~ ]+$/)).min(1).max(80).required(),
          prefix: joi.string().isoDate().required(),
          source_folder: joi.string().trim().required(),
          target_folder: joi.string().trim(),
        },
      },
    },
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json'),
};
