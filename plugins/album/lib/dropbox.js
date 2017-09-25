const Dropbox = require('dropbox');

const log = require('../../log');
const utils = require('../../utils');

const accessToken = utils.env.get('HISTORY_DROPBOX_ACCESS_TOKEN');
const logger = log.createLogger('Album Dropbox');

const dropbox = new Dropbox({ accessToken });

function determineError(e) {
  const wrap = msg => `error (${msg})`;

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

async function getAllImagePaths(path) {
  if (!accessToken) {
    logger.panic('getAllImagePaths error (Missing Dropbox API accessToken)');

    return [];
  }

  try {
    const { entries } = await dropbox.filesListFolder({ path });
    const createTempPath = entry => dropbox.filesGetTemporaryLink({ path: entry.path_lower });
    const promises = entries.map(createTempPath);
    const urls = await Promise.all(promises);

    return urls.map(url => url.link);
  } catch (e) {
    logger.debug(`getAllImagePaths ${determineError(e)}`);

    return [];
  }
}

async function getImagePath(path) {
  if (!accessToken) {
    logger.panic('getImagePath error (Missing Dropbox API accessToken)');

    return '';
  }

  try {
    const tempPath = await dropbox.filesGetTemporaryLink({ path });

    return tempPath.link;
  } catch (e) {
    logger.debug(`getImagePath ${path} ${determineError(e)}`);

    return '';
  }
}

async function transform(response, field) {
  if (!accessToken) {
    logger.panic('transform error (Missing Dropbox API accessToken)');

    return response;
  }

  try {
    const promises = response.album.items.map(item => getImagePath(item[field]));
    const urls = await Promise.all(promises);
    response.album.items = response.album.items.map((item, index) => {
      const merge = item;

      if (urls[index]) {
        merge.thumbPath = urls[index];
      }

      return merge;
    });

    return response;
  } catch (e) {
    logger.debug(`transform ${determineError(e)}`);

    return response;
  }
}

module.exports = { getImagePath, getAllImagePaths, transform };
