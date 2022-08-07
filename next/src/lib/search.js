/**
 * Index search keywords from search xml element and dedupe
 *
 * @param {Object[]} items
 * @param {string[]} items.search
 * @returns {{ indexedKeywords }}
 */
function indexKeywords(items) {
  const summedKeywords = items.reduce((out, item) => {
    item?.search?.split(', ').forEach((i) => {
      // eslint-disable-next-line no-param-reassign
      out[i] = (out[i] || 0) + 1
    }, {})
    return out
  }, {})

  const sortedKeywords = Object.fromEntries(
    Object.entries(summedKeywords).sort(([, a], [, b]) => b - a),
  )

  // prepare for react-select in useSearch custom hook
  return { indexedKeywords: Object.keys(sortedKeywords).map((i) => ({ label: `${i} (${sortedKeywords[i]})`, value: i })) }
}

module.exports = {
  indexKeywords,
}
