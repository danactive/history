const fsCallback = require('fs')

const fs = fsCallback.promises

const errorSchema = (message) => {
  const out = { galleries: [] }
  if (!message) return out
  return { ...out, error: { message } }
}

/**
 * Get Galleries from local filesystem
 * @param {boolean} returnEnvelope will enable a return value with HTTP status code and body
 * @returns {Promise} galleries
 */
async function get(returnEnvelope = false) {
  try {
    const hasPrefix = (content) => content.isDirectory()
    const namesOnly = (content) => content.name

    const contents = await fs.readdir('../public/galleries', { withFileTypes: true })
    const body = { galleries: contents.filter(hasPrefix).map(namesOnly) }

    if (returnEnvelope) {
      return { body, status: 200 }
    }

    return body
  } catch (e) {
    if (returnEnvelope) {
      return { body: errorSchema('No galleries are found'), status: 404 }
    }

    return errorSchema()
  }
}

module.exports = {
  get,
  errorSchema,
}
