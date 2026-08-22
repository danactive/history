import { getItemYearFromFilename, isYearToken } from './domains/years'
import { buildVisitedRegionCountryIndex, getVisitedPlace } from './visited-core'
import { calcAgeAtDate, resolvePhotoDate } from '../utils/person-age'
import { matchCorpus, normalizeSearchValue } from '../utils/search'
import type { IndexedKeywords, VisitedPlace } from '../types/common'

export type FilterQueryTermKind = 'text' | 'keyword' | 'country' | 'region' | 'person' | 'tag' | 'year' | 'age'

export type FilterQueryTerm = {
  type: 'term'
  kind: FilterQueryTermKind
  value: string
}

export type FilterQueryNode = FilterQueryTerm | {
  type: 'and' | 'or'
  children: FilterQueryNode[]
}

export type FilterQueryContext = {
  countries?: string[]
  regions?: string[]
  people?: string[]
  tags?: string[]
  keywords?: string[]
}

export type FilterQueryItem = {
  corpus: string
  city?: string
  filename?: string | string[]
  photoDate?: string | null
  persons?: { full: string, dob?: string | null }[] | null
  search?: string | null
  visitedPlace?: VisitedPlace | null
  year?: string | null
}

type QueryToken =
  | { type: 'term', value: string }
  | { type: 'and' | 'or' | 'open' | 'close' }

const explicitKinds: Record<string, FilterQueryTermKind> = {
  country: 'country',
  region: 'region',
  person: 'person',
  tag: 'tag',
  keyword: 'keyword',
  year: 'year',
  age: 'age',
}

function isFilterQueryTermKind(value: string): value is FilterQueryTermKind {
  return value === 'text' || Object.hasOwn(explicitKinds, value)
}

function normalize(value: string) {
  return normalizeSearchValue(value)
}

function uniqueExactMatch(value: string, candidates: string[] = []) {
  const normalizedValue = normalize(value)
  const matches = candidates.filter(candidate => normalize(candidate) === normalizedValue)
  return matches.length === 1 ? matches[0] ?? null : null
}

function unquote(value: string) {
  const trimmed = value.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\(["\\])/g, '$1')
  }
  return trimmed
}

function quote(value: string) {
  return /[\s()&|:"\\]/.test(value) ? `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"` : value
}

function tokenize(input: string): QueryToken[] {
  const tokens: QueryToken[] = []
  let current = ''
  let quoted = false

  const pushTerm = () => {
    const value = current.trim()
    if (value) tokens.push({ type: 'term', value })
    current = ''
  }

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index]
    const next = input[index + 1]

    if (quoted && char === '\\' && next) {
      current += char + next
      index += 1
      continue
    }

    if (char === '"') {
      quoted = !quoted
      current += char
      continue
    }

    if (!quoted && char === '&' && next === '&') {
      pushTerm()
      tokens.push({ type: 'and' })
      index += 1
      continue
    }

    if (!quoted && char === '|' && next === '|') {
      pushTerm()
      tokens.push({ type: 'or' })
      index += 1
      continue
    }

    if (!quoted && char === '(') {
      pushTerm()
      tokens.push({ type: 'open' })
      continue
    }

    if (!quoted && char === ')') {
      pushTerm()
      tokens.push({ type: 'close' })
      continue
    }

    current += char
  }

  pushTerm()
  return tokens
}

export function classifyFilterQueryTerm(rawValue: string, context: FilterQueryContext = {}): FilterQueryTerm {
  const value = rawValue.trim()
  const explicitMatch = value.match(/^([a-z]+)\s*:\s*(.+)$/i)
  if (explicitMatch) {
    const kind = explicitKinds[explicitMatch[1].toLowerCase()]
    const explicitValue = unquote(explicitMatch[2])
    if (kind && explicitValue) {
      return { type: 'term', kind, value: explicitValue }
    }
  }

  const normalizedValue = unquote(value)
  const country = uniqueExactMatch(normalizedValue, context.countries)
  const region = uniqueExactMatch(normalizedValue, context.regions)
  const person = uniqueExactMatch(normalizedValue, context.people)
  const tag = uniqueExactMatch(normalizedValue, context.tags)
  const keyword = uniqueExactMatch(normalizedValue, context.keywords)
  const matches: FilterQueryTerm[] = [
    isYearToken(normalizedValue) ? { type: 'term', kind: 'year', value: normalizedValue } : null,
    country ? { type: 'term', kind: 'country', value: country } : null,
    region ? { type: 'term', kind: 'region', value: region } : null,
    person ? { type: 'term', kind: 'person', value: person } : null,
    tag ? { type: 'term', kind: 'tag', value: tag } : null,
    keyword ? { type: 'term', kind: 'keyword', value: keyword } : null,
  ].filter((term): term is FilterQueryTerm => term !== null)
  if (matches.length === 1) return matches[0]

  return { type: 'term', kind: 'text', value: normalizedValue }
}

export function parseFilterQuery(input: string, context: FilterQueryContext = {}): FilterQueryNode | null {
  const tokens = tokenize(input)
  if (tokens.length === 0) return null

  let index = 0
  const parsePrimary = (): FilterQueryNode | null => {
    const token = tokens[index]
    if (!token) return null

    if (token.type === 'term') {
      index += 1
      return classifyFilterQueryTerm(token.value, context)
    }

    if (token.type === 'open') {
      index += 1
      const expression = parseOr()
      if (tokens[index]?.type === 'close') index += 1
      return expression
    }

    return null
  }

  const merge = (type: 'and' | 'or', left: FilterQueryNode, right: FilterQueryNode): FilterQueryNode => {
    const children = [left, right].flatMap(node => node.type === type ? node.children : [node])
    return { type, children }
  }

  const parseAnd = (): FilterQueryNode | null => {
    let left = parsePrimary()
    while (left && tokens[index]?.type === 'and') {
      index += 1
      const right = parsePrimary()
      if (!right) return left
      left = merge('and', left, right)
    }
    return left
  }

  const parseOr = (): FilterQueryNode | null => {
    let left = parseAnd()
    while (left && tokens[index]?.type === 'or') {
      index += 1
      const right = parseAnd()
      if (!right) return left
      left = merge('or', left, right)
    }
    return left
  }

  return parseOr()
}

function precedence(node: FilterQueryNode) {
  return node.type === 'or' ? 1 : node.type === 'and' ? 2 : 3
}

function formatTerm({ kind, value }: FilterQueryTerm) {
  return kind === 'text' ? quote(value) : `${kind}:${quote(value)}`
}

export function formatFilterQuery(node: FilterQueryNode | null, parentPrecedence = 0): string {
  if (!node) return ''
  if (node.type === 'term') return formatTerm(node)

  const nodePrecedence = precedence(node)
  const joiner = node.type === 'and' ? ' && ' : ' || '
  const formatted = node.children
    .map(child => formatFilterQuery(child, nodePrecedence))
    .join(joiner)
  return nodePrecedence < parentPrecedence ? `(${formatted})` : formatted
}

export function normalizeFilterQuery(input: string, context: FilterQueryContext = {}) {
  return formatFilterQuery(parseFilterQuery(input, context))
}

export function getFilterQueryContext({
  indexedKeywords = [],
  personOptions = [],
  locationOptions = [],
}: {
  indexedKeywords?: IndexedKeywords[]
  personOptions?: { value: string }[]
  locationOptions?: { value: string, visitedPlace: VisitedPlace }[]
}): FilterQueryContext {
  return {
    countries: Array.from(new Set(locationOptions.map(option => option.visitedPlace.country))),
    regions: Array.from(new Set(locationOptions.flatMap(option => option.visitedPlace.region ? [option.visitedPlace.region] : []))),
    people: personOptions.map(option => option.value),
    tags: indexedKeywords
      .filter(option => option.filterKind === 'tag')
      .map(option => option.value),
    keywords: indexedKeywords
      .filter(option => !option.filterKind || option.filterKind === 'keyword')
      .map(option => option.value),
  }
}

function hasExactSearchToken(item: FilterQueryItem, value: string) {
  const normalizedValue = normalize(value)
  return item.search?.split(',').some(token => normalize(token) === normalizedValue) ?? false
}

function getItemYear(item: FilterQueryItem) {
  if (item.filename) {
    return getItemYearFromFilename({ filename: item.filename, photoDate: item.photoDate ?? null })
  }
  return isYearToken(item.year ?? '') ? item.year ?? '' : ''
}

function matchesPerson(item: FilterQueryItem, person: string) {
  const normalizedPerson = normalize(person)
  if (item.persons?.length) {
    return item.persons.some(candidate => normalize(candidate.full) === normalizedPerson)
  }
  return [item.search, item.corpus].some(value => value?.toLowerCase().includes(normalizedPerson))
}

function matchesAge(item: FilterQueryItem, ageValue: string, requiredPerson: string | null = null) {
  if (!item.persons?.length || !item.filename) return false
  const photoDate = resolvePhotoDate({ filename: item.filename, photoDate: item.photoDate ?? null })
  return item.persons.some((person) => {
    if (requiredPerson && normalize(person.full) !== normalize(requiredPerson)) return false
    const age = person.dob ? calcAgeAtDate(person.dob, photoDate) : 'unknown'
    return String(age) === ageValue
  })
}

function matchesTerm(item: FilterQueryItem, term: FilterQueryTerm, getItemVisitedPlace: (item: FilterQueryItem) => VisitedPlace | null) {
  switch (term.kind) {
    case 'text':
      return matchCorpus(item.corpus, term.value)
    case 'country':
      return normalize(getItemVisitedPlace(item)?.country ?? '') === normalize(term.value)
    case 'region':
      return normalize(getItemVisitedPlace(item)?.region ?? '') === normalize(term.value)
    case 'person':
      return matchesPerson(item, term.value)
    case 'tag':
      return hasExactSearchToken(item, term.value)
    case 'year': {
      const itemYear = getItemYear(item)
      return itemYear ? itemYear === term.value : matchCorpus(item.corpus, term.value)
    }
    case 'keyword':
      return hasExactSearchToken(item, term.value)
    case 'age':
      return matchesAge(item, term.value)
  }
}

function getDirectPersonAgePair(node: FilterQueryNode) {
  if (node.type !== 'and') return null
  const person = node.children.find((child): child is FilterQueryTerm => child.type === 'term' && child.kind === 'person')
  const age = node.children.find((child): child is FilterQueryTerm => child.type === 'term' && child.kind === 'age')
  return person && age ? { person, age } : null
}

export function filterItemsByQuery<ItemType extends FilterQueryItem>(items: ItemType[], query: FilterQueryNode | null) {
  if (!query) return items

  const regionCountryIndex = buildVisitedRegionCountryIndex(
    items.filter((item): item is ItemType & { city: string } => typeof item.city === 'string'),
  )

  const getItemVisitedPlace = (item: FilterQueryItem) => item.visitedPlace ?? (
    item.city ? getVisitedPlace({ city: item.city }, regionCountryIndex) : null
  )

  const matchesNode = (item: FilterQueryItem, node: FilterQueryNode): boolean => {
    if (node.type === 'term') return matchesTerm(item, node, getItemVisitedPlace)
    if (node.type === 'or') return node.children.some(child => matchesNode(item, child))

    const pair = getDirectPersonAgePair(node)
    if (pair && !matchesAge(item, pair.age.value, pair.person.value)) return false
    return node.children.every(child => matchesNode(item, child))
  }

  return items.filter(item => matchesNode(item, query))
}

export function addFilterQueryTerm(query: string, term: FilterQueryTerm, context: FilterQueryContext = {}) {
  const existing = parseFilterQuery(query, context)
  const next: FilterQueryNode = existing ? { type: 'and', children: [existing, term] } : term
  return formatFilterQuery(next)
}

export function getConjunctiveFilterTerms(query: string, context: FilterQueryContext = {}) {
  const node = parseFilterQuery(query, context)
  if (!node) return new Map<FilterQueryTermKind, string>()

  const terms = node.type === 'and' ? node.children : [node]
  if (terms.some(term => term.type !== 'term')) return new Map<FilterQueryTermKind, string>()

  const values = new Map<FilterQueryTermKind, string>()
  for (const term of terms) {
    if (term.type !== 'term' || values.has(term.kind)) continue
    values.set(term.kind, term.value)
  }
  return values
}

export function replaceConjunctiveFilterTerms(
  query: string,
  replacements: Partial<Record<FilterQueryTermKind, string | null>>,
  context: FilterQueryContext = {},
) {
  const node = parseFilterQuery(query, context)
  const removableKinds = new Set(Object.keys(replacements).filter(isFilterQueryTermKind))
  const existingChildren = node?.type === 'and' ? node.children : node ? [node] : []
  const children = existingChildren.filter((child) => child.type !== 'term' || !removableKinds.has(child.kind))

  Object.entries(replacements).forEach(([kind, value]) => {
    if (!isFilterQueryTermKind(kind)) return
    if (value) children.push({ type: 'term', kind, value })
  })

  if (children.length === 0) return ''
  return formatFilterQuery(children.length === 1 ? children[0] : { type: 'and', children })
}
