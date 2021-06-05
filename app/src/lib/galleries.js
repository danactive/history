const fsCallback = require('fs')

const fs = fsCallback.promises

async function get(errorSchema = (msg) => msg) {
  try {
    const hasPrefix = (content) => content.isDirectory()
    const namesOnly = (content) => content.name

    const contents = await fs.readdir('../public/galleries', { withFileTypes: true })

    return { body: { galleries: contents.filter(hasPrefix).map(namesOnly) }, status: 200 }
  } catch (e) {
    return { body: errorSchema('No galleries are found'), status: 404 }
  }
}

module.exports = {
  get,
}
