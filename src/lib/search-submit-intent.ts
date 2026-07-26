import type { IndexedKeywords, VisitedPlace } from '../types/common'

export type SearchSubmitIntent =
  | { type: 'visited'; visitedPlace: VisitedPlace }
  | { type: 'structured'; option: IndexedKeywords }
  | { type: 'keyword'; keyword: string }
  | { type: 'noop' }

export function resolveSearchSubmitIntent({
  selectedOption,
  inputValue,
}: {
  selectedOption: IndexedKeywords | null
  inputValue: string
}): SearchSubmitIntent {
  if (selectedOption?.visitedPlace) {
    return {
      type: 'visited',
      visitedPlace: selectedOption.visitedPlace,
    }
  }

  if (selectedOption && !selectedOption.isCreateOption) {
    return {
      type: 'structured',
      option: selectedOption,
    }
  }

  const keyword = (selectedOption?.value ?? inputValue).trim()
  if (!keyword) {
    return { type: 'noop' }
  }

  return {
    type: 'keyword',
    keyword,
  }
}
