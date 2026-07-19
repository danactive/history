type PersonSearchItem = {
  persons?: Array<{ full: string }> | null
  search?: string | null
}

export function resolveUniquePersonName(items: PersonSearchItem[], rawKeyword: string) {
  const normalizedKeyword = rawKeyword.trim().toLowerCase()
  if (!normalizedKeyword) return null

  const personNames = [...new Set(items
    .flatMap(item => item.persons?.map(person => person.full) ?? []))]

  const exactPersonMatch = personNames.find(name => name.toLowerCase() === normalizedKeyword)
  if (exactPersonMatch) return exactPersonMatch

  const partialPersonMatches = personNames.filter(name => name.toLowerCase().includes(normalizedKeyword))
  if (partialPersonMatches.length === 1) {
    return partialPersonMatches[0] ?? null
  }

  const searchTokenMatches = [...new Set(items
    .flatMap(item => item.search?.split(', ').map(token => token.trim()) ?? []))]
  const exactSearchMatch = searchTokenMatches.find(token => token.toLowerCase() === normalizedKeyword)
  if (exactSearchMatch) return exactSearchMatch

  const partialSearchMatches = searchTokenMatches.filter(token => token.toLowerCase().includes(normalizedKeyword))
  if (partialSearchMatches.length === 1) {
    return partialSearchMatches[0] ?? null
  }

  return null
}
