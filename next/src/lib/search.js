/**
 * Index search keywords from search xml element and dedupe
 *
 * @param {Object[]} items
 * @returns {{ indexedKeywords }}
 */
function indexKeywords(items) {
  const indexedKeywords = items.reduce((out, item) => {
    item?.search?.split(', ').forEach((i) => out.add(i))
    return out
  }, new Set())

  return { indexedKeywords: Array.from(indexedKeywords) }
}

module.exports = {
  indexKeywords,
}
