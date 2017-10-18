const existsChecker = require('../../exists/lib/exists');
const filenamer = require('./filenames');
const renamer = require('./rename');
const routes = require('../../../lib/routes');
const validation = require('../../../lib/validation');

const formatJson = json => ({ xml: json.xml, filenames: json.filenames });

const handler = (request, reply) => {
  const {
    payload: {
      filenames: fromFilenames, prefix, preview, raw: isRaw, rename_associated: renameAssociated, source_folder: sourceFolder
    }
  } = request;

  const handleResponse = routes.createFormatReply({ formatJson, isRaw, reply });
  const handleError = routes.createErrorReply(reply);

  const lookupFilenames = () => filenamer.futureFilenamesOutputs(fromFilenames, prefix);

  const renamePaths = (futureFilenames) => {
    const options = { preview, renameAssociated };
    const toFilenames = futureFilenames.filenames;

    renamer.renamePaths(sourceFolder, fromFilenames, toFilenames, options)
      .then(routes.createFormatReply({ formatJson: () => ({ xml: futureFilenames.xml, filenames: toFilenames }), isRaw, reply }))
      .catch(handleError);
  };


  if (preview === true) {
    existsChecker.pathExists(sourceFolder)
      .then(lookupFilenames)
      .then(handleResponse)
      .catch(handleError);
  } else {
    existsChecker.pathExists(sourceFolder)
      .then(lookupFilenames)
      .then(renamePaths)
      .catch(handleError);
  }
};

exports.register = (server, options, next) => {
  server.route({
    method: 'POST',
    path: '/rename',
    config: {
      handler,
      tags: ['api'],
      validate: {
        payload: {
          filenames: validation.filenames,
          prefix: validation.prefix,
          preview: validation.preview,
          source_folder: validation.sourceFolder,
          raw: validation.raw,
          rename_associated: validation.renameAssociated
        }
      },
      response: {
        schema: {
          filenames: validation.filenames,
          xml: validation.xml
        },
        failAction: (request, reply, error) => reply(`Response validation error (${error.message})`).code(400)
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: 'rename',
  version: '2.1.1'
};
