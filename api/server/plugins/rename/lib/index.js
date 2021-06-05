const existsChecker = require('../../../../../app/src/lib/exists');
const filenamer = require('./filenames');
const renamer = require('./rename');
const routes = require('../../../lib/routes');
const validation = require('../../../lib/validation');

const formatJson = (json) => ({ xml: json.xml, filenames: json.filenames });

const handler = (request) => new Promise((reply) => {
  const {
    filenames: fromFilenames,
    prefix,
    preview,
    rename_associated: renameAssociated,
    source_folder: sourceFolder,
  } = request.payload;

  const handleResponse = (json) => reply(formatJson(json));
  const handleError = routes.createErrorReply(reply);

  const lookupFilenames = () => filenamer.futureFilenamesOutputs(fromFilenames, prefix);

  const renamePaths = (futureFilenames) => {
    const options = { preview, renameAssociated };
    const toFilenames = futureFilenames.filenames;

    renamer.renamePaths(sourceFolder, fromFilenames, toFilenames, options)
      .then(() => reply({ xml: futureFilenames.xml, filenames: toFilenames }))
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
});

const register = (server) => {
  server.route({
    method: 'POST',
    path: '/rename',
    options: {
      handler,
      tags: ['api'],
      validate: {
        payload: {
          filenames: validation.filenames,
          prefix: validation.prefix,
          preview: validation.preview,
          source_folder: validation.sourceFolder,
          raw: validation.raw,
          rename_associated: validation.renameAssociated,
        },
      },
      response: {
        schema: {
          filenames: validation.filenames,
          xml: validation.xml,
        },
        failAction: (request, reply, error) => reply.response(`Response validation error (${error.message})`).code(400),
      },
    },
  });
};

const plugin = {
  register,
  name: 'rename',
  version: '2.2.0',
};

module.exports = { plugin };
