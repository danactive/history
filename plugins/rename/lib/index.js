'use strict';

exports.register = (server, options, next) => {
  const joi = require('joi');

  server.route({
    method: 'POST',
    path: '/rename',
    config: {
      handler: (request, reply) => {
        const filenames = request.payload.filenames;
        require('../../exists/lib').folderExists(request.payload.source_folder)
          .then(() => require('./filenames').getFutureFilenames(request.payload.prefix, filenames.length))
          .then((futureFilenames) => {
            require('./rename').renamePaths(request.payload.source_folder, filenames, futureFilenames.filenames);
            reply(futureFilenames.xml);
          })
          .catch(() => {
            reply(`Source Folder does not exist in the file system (${request.payload.source_folder})`);
          });
      },
      tags: ['api'],
      validate: {
        payload: {
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
