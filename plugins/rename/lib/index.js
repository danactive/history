/* global require */
const boom = require('boom');
const joi = require('joi');

const existsMod = require('../../exists/lib');
const filenamesMod = require('./filenames');
// const logMod = require('../../log/lib');
const renameMod = require('./rename');

const handler = (request, reply) => {
  const fromFilenames = request.payload.filenames;
  const prefix = request.payload.prefix;
  const sourceFolder = request.payload.source_folder;
  const renameAssociated = request.payload.rename_associated;
  const options = { renameAssociated };
  // const log = logMod('plugin-rename-index');

  const handleError = (error) => {
    const notFound = boom.notFound(`Source Folder does not exist in the file system 
        (${sourceFolder}) with error (${error})`);
    const boomError = (error.isBoom) ? error : notFound;

    reply(boomError);
  };

  const lookupFilenames = () => filenamesMod.calculateFutureFilenames(prefix, fromFilenames.length);

  const renamePaths = (futureFilenames) => {
    const toFilenames = futureFilenames.filenames;
    renameMod.renamePaths(sourceFolder, fromFilenames, toFilenames, options)
      .then(() => reply({ xml: futureFilenames.xml, filenames: toFilenames }))
      .catch(handleError);
  };

  existsMod.pathExists(sourceFolder)
    .then(lookupFilenames)
    .then(renamePaths)
    .catch(handleError);
};

const validation = {
  filenames: joi.array().items(joi.string().regex(/^[-\w^&'@{}[\],$=!#().%+~ ]+$/))
    .min(1).max(80)
    .required()
    .example('["DSC01229.JPG"]'),
  prefix: joi.string().isoDate().required().example('2016-12-31'),
  renameAssociated: joi.boolean().default(false)
    .description('JPG and RAW or video and still image are common associated pairs that should rename together'),
  sourceFolder: joi.string().trim().required().example('/public/todo/'),
  xml: joi.string().required().regex(/<photo\b[^>]*>(.*?)<\/photo>/)
    .example(`<photo id="1"><filename>2016-12-31-37.jpg</filename></photo>` + // eslint-disable-line quotes
      `<photo id="2"><filename>2016-12-31-64.jpg</filename></photo>` + // eslint-disable-line quotes
      `<photo id="3"><filename>2016-12-31-90.jpg</filename></photo>`), // eslint-disable-line quotes
};

exports.register = (server, options, next) => {
  server.route({
    method: 'POST',
    path: '/rename',
    config: {
      handler,
      tags: ['api', 'plugin', 'v1', 'v2'],
      validate: {
        payload: {
          filenames: validation.filenames,
          prefix: validation.prefix,
          source_folder: validation.sourceFolder,
          rename_associated: validation.renameAssociated,
        },
      },
      response: {
        schema: {
          filenames: validation.filenames,
          xml: validation.xml,
        },
      },
    },
  });

  next();
};

exports.register.attributes = {
  name: 'history-rename',
  version: '2.0.0',
};
