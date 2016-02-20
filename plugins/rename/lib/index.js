'use strict';

exports.register = (server, options, next) => {
  const joi = require('joi');

  server.route({
    method: 'POST',
    path: '/rename',
    config: {
      handler: (request, reply) => {
        const filenames = request.payload.filenames;
        require('../../exists/lib').pathExists(request.payload.source_folder)
          .then(() => require('./filenames').getFutureFilenames(request.payload.prefix, filenames.length))
          .then((futureFilenames) => {
            require('./rename').renamePaths(
              request.payload.source_folder,
              filenames,
              futureFilenames.filenames,
              {
                renameAssociated: request.payload.rename_associated,
              });
            reply({ xml: futureFilenames.xml });
          })
          .catch((error) => {
            let boomError;
            if (error.isBoom) {
              boomError = error;
            } else {
              boomError = require('boom').notFound(`Source Folder does not exist in the file system ` +
                `(${request.payload.source_folder}) with error (${error})`);
            }
            reply(boomError);
          });
      },
      tags: ['api', 'plugin', 'v1'],
      validate: {
        payload: {
          filenames: joi.array().items(joi.string().regex(/^[-\w^&'@{}[\],$=!#().%+~ ]+$/))
            .min(1).max(80).required().example('["DSC01229.JPG"]'),
          prefix: joi.string().isoDate().required().example('2016-12-31'),
          source_folder: joi.string().trim().required().example('/public/todo/'),
          rename_associated: joi.boolean().default(false)
            .description(`JPG and RAW or video and still image are common ` +
              `associated pairs that should rename together`),
        },
      },
      response: {
        schema: {
          xml: joi.string().required().regex(/<photo\b[^>]*>(.*?)<\/photo>/)
          .example(`<photo id="1"><filename>2016-04-05-37.jpg</filename></photo>` +
            `<photo id="2"><filename>2016-04-05-64.jpg</filename></photo>` +
            `<photo id="3"><filename>2016-04-05-90.jpg</filename></photo>`),
        },
      },
    },
  });

  next();
};

exports.register.attributes = {
  pkg: require('../package.json'),
};
