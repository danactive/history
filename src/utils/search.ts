// Helper functions extracted from the component for performance
// and to keep the hook logic clean.

const AND_OPERATOR = '&&'
const OR_OPERATOR = '||'

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

/**
 * Matches a search keyword against a corpus string using boolean operators.
 * Supports AND (&&) and OR (||) operators with single-level parentheses.
 *
 * Simple searches (words separated by spaces) are treated as implicit AND operations.
 * For example, "apple banana" matches text containing both "apple" AND "banana".
 *
 * Limitation: Nested parentheses are NOT supported. Expressions like `((a || b) && c)`
 * or `(a && (b || c))` will not be evaluated correctly. Only simple single-level
 * parentheses work: `(a || b) && c` or `a && (b || c)`.
 *
 * @param {string} corpus - The text to search within
 * @param {string} kword - The search keyword with optional boolean operators (&&, ||) and parentheses
 * @returns {boolean} True if the keyword matches the corpus
 *
 * @example
 * ```ts
 * matchCorpus('apple banana', 'apple banana') // true (implicit AND)
 * matchCorpus('apple banana', 'apple && banana') // true
 * matchCorpus('orange banana', 'apple || orange') // true
 * matchCorpus('apple banana', '(apple || orange) && banana') // true
 * matchCorpus('text', '((a || b) && c)') // NOT SUPPORTED - will not work correctly
 * ```
 */
export const matchCorpus = (corpus: string, kword: string): boolean => {
  const normalizedCorpus = normalize(corpus)
  const normalizedKeyword = normalize(kword)

  const evaluateExpression = (expr: string): boolean => {
    // If there's no AND or OR operator, treat spaces as implicit AND
    if (!expr.includes(AND_OPERATOR) && !expr.includes(OR_OPERATOR)) {
      const terms = expr.split(/\s+/).filter(t => t.length > 0)
      return terms.every((term) => normalizedCorpus.includes(term.trim()))
    }

    // If there's no AND operator, evaluate as OR expression
    if (!expr.includes(AND_OPERATOR)) {
      return expr
        .split(OR_OPERATOR)
        .some((term) => normalizedCorpus.includes(term.trim()))
    }

    // Split by AND carefully, preserving content inside parentheses
    const andParts: string[] = []
    let currentPart = ''
    let depth = 0

    for (let i = 0; i < expr.length; i++) {
      const char = expr[i]
      const nextChar = expr[i + 1]

      if (char === '(') depth++
      if (char === ')') depth--

      // Check for && outside of parentheses
      if (char === '&' && nextChar === '&' && depth === 0) {
        andParts.push(currentPart.trim())
        currentPart = ''
        i++ // skip the second &
        continue
      }

      currentPart += char
    }
    if (currentPart.trim()) {
      andParts.push(currentPart.trim())
    }

    return andParts.every((part) => {
      // Check if this part has parentheses
      const parenMatch = part.match(/^\((.*)\)$/)
      if (parenMatch) {
        const innerExpr = parenMatch[1]
        return innerExpr
          .split(OR_OPERATOR)
          .some((term) => normalizedCorpus.includes(term.trim()))
      }

      // Regular term - check if corpus contains it
      return normalizedCorpus.includes(part)
    })
  }

  return evaluateExpression(normalizedKeyword)
}
