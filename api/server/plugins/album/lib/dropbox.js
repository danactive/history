const log = require('../../log');
const utils = require('../../utils');

const logger = log.createLogger('Album Dropbox');

function determineError(e) {
  const wrap = (msg) => `error (${msg})`;

  if (e.error && e.error.message) {
    return wrap(e.error.message);
  }

  if (e.error && e.error.error_summary) {
    return wrap(e.error.error_summary);
  }

  if (e.error) {
    return wrap(e.error);
  }

  return e;
}

async function getImagePath(dbx, path) {
  try {
    const tempPath = await dbx.filesGetTemporaryLink({ path });

    return tempPath.link;
  } catch (e) {
    logger.debug(`getImagePath ${path} ${determineError(e)}`);

    return null;
  }
}

function createTransform(dbx) {
  return async (response, field) => {
    try {
      const out = utils.clone(response);
      const promises = response.album.items.map((item) => getImagePath(dbx, item[field]));
      const urls = await Promise.all(promises);

      response.album.items.forEach((item, index) => {
        out.album.items[index].thumbPath = urls[index];
      });

      return out;
    } catch (e) {
      logger.debug(`transform ${determineError(e)}`);

      return response;
    }
  };
}

module.exports = { createTransform };
