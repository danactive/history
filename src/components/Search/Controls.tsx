import { Button, Chip, Stack } from '@mui/joy'

import AutoComplete from '../ComboBox'
import { filterChipSx, pillActionButtonSx } from './control-styles'
import RemovableFilterChip from './RemovableFilterChip'
import type { IndexedKeywords } from '../../types/common'
import styles from '../../hooks/search.module.css'

type QueryMode = 'AND' | 'OR' | null

type ParsedKeywordQuery = {
  mode: QueryMode
  tokens: string[]
  isAdvanced: boolean
}

type Props = {
  summaryLabel?: string
  visibleCount: number
  totalCount: number
  keyword: string
  parsedKeyword: ParsedKeywordQuery
  activeFacetCounts: number[]
  advancedFacetCount: number | null
  mapFilterEnabled?: boolean
  mapFacetCount?: number
  searchOptions: IndexedKeywords[]
  selectedOption: IndexedKeywords | null
  inputValue: string
  canBookmark: boolean
  detailActions: React.ReactNode
  BookmarkButton: React.ComponentType
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onSelectedOptionChange: (value: IndexedKeywords | null) => void
  onInputValueChange: (value: string) => void
  onRemoveKeywordToken: (tokenIndex: number) => void
  onClear: () => void
  onClearMapFilter?: (coordinates?: [number, number] | null) => void
  extraFilterChips?: React.ReactNode
  extraFiltersActive?: boolean
  onClearAll?: () => void
  clearActionLabel?: string
  clearActionTitle?: string
}

function formatQueryToken(token: string, count: number) {
  const match = token.match(/^(country|region|person|tag|year|age|keyword):(.+)$/i)
  if (!match) return `${token} (${count})`
  const labels: Record<string, string> = {
    country: 'Country',
    region: 'Region',
    person: 'Person',
    tag: 'Tag',
    year: 'Year',
    age: 'Age',
    keyword: 'Keyword',
  }
  const value = match[2].replace(/^"(.*)"$/, '$1')
  return `${labels[match[1].toLowerCase()]}: ${value} (${count})`
}

function getQueryRemoveTitle(token: string) {
  const match = token.match(/^(person|tag|year|age):(.+)$/i)
  if (!match) return `Remove query term ${token}`
  const value = match[2].replace(/^"(.*)"$/, '$1')
  return `Clear ${match[1].toLowerCase()} filter ${value}`
}

export default function Controls({
  summaryLabel = 'Search results',
  visibleCount,
  totalCount,
  keyword,
  parsedKeyword,
  activeFacetCounts,
  advancedFacetCount,
  mapFilterEnabled,
  mapFacetCount,
  searchOptions,
  selectedOption,
  inputValue,
  canBookmark,
  detailActions,
  BookmarkButton,
  onSubmit,
  onSelectedOptionChange,
  onInputValueChange,
  onRemoveKeywordToken,
  onClear,
  onClearMapFilter,
  extraFilterChips,
  extraFiltersActive = false,
  onClearAll,
  clearActionLabel = 'Clear',
  clearActionTitle = 'Clear search and view adjacent photos',
}: Props) {
  const keywordResultLabel = keyword ? <> for &quot;{keyword}&quot;</> : null
  const hasActiveFilters = Boolean(keyword || mapFilterEnabled || extraFiltersActive)

  return (
    <form onSubmit={onSubmit}>
      <div className={styles.root}>
        <div className={styles.summaryRow}>
          <div className={styles.summaryCard}>
            <h3 className={styles.searchCount}>
              <span className={styles.summaryLabel}>{summaryLabel}</span>{' '}
              <span className={styles.searchCountValue}>{visibleCount}</span> of {totalCount}
              {keywordResultLabel}
            </h3>
          </div>
          {detailActions ? <div className={styles.detailActions}>{detailActions}</div> : null}
        </div>

        {hasActiveFilters ? (
          <div className={styles.chipsSection}>
            <div className={styles.chipsLabel}>Active filters</div>
            <div className={styles.chipsRow}>
              {keyword && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  {parsedKeyword.mode && (
                    <Chip size="sm" color="primary" variant="outlined" sx={filterChipSx}>
                      {parsedKeyword.mode}
                    </Chip>
                  )}
                  {parsedKeyword.isAdvanced ? (
                    <RemovableFilterChip
                      className={styles.filterToken}
                      label={`Advanced query (${advancedFacetCount ?? visibleCount})`}
                      onRemove={onClear}
                      removeTitle="Clear search and view adjacent photos"
                      removeAriaLabel="Clear advanced query"
                    />
                  ) : (
                    parsedKeyword.tokens.map((token, idx) => (
                      <RemovableFilterChip
                        key={`${token}-${idx}`}
                        className={styles.filterToken}
                        label={formatQueryToken(token, activeFacetCounts[idx] ?? visibleCount)}
                        onRemove={() => onRemoveKeywordToken(idx)}
                        removeTitle={getQueryRemoveTitle(token)}
                      />
                    ))
                  )}
                </Stack>
              )}
              {mapFilterEnabled && (
                <RemovableFilterChip
                  className={styles.filterToken}
                  label={`Map filter (${mapFacetCount ?? totalCount})`}
                  onRemove={() => onClearMapFilter?.()}
                  removeTitle="Clear map filter"
                />
              )}
              {extraFilterChips}
            </div>
          </div>
        ) : null}

        <div className={styles.inputRow}>
          <div className={styles.inputWrap}>
            <AutoComplete
              className={styles.autocomplete}
              options={searchOptions}
              onChange={onSelectedOptionChange}
              value={selectedOption}
              inputValue={inputValue}
              onInputChange={onInputValueChange}
            />
          </div>
          <div className={styles.actionsRow}>
            <Button
              type="submit"
              title="Use `&&`, `||`, and parentheses; known places, people, tags, years, and ages are detected automatically."
              color="neutral"
              sx={pillActionButtonSx}
            >
              Filter
            </Button>
            {hasActiveFilters && (
              <Button
                type="button"
                onClick={onClearAll ?? onClear}
                color="primary"
                variant="soft"
                title={clearActionTitle}
                sx={pillActionButtonSx}
              >
                {clearActionLabel}
              </Button>
            )}
            {canBookmark && <BookmarkButton />}
          </div>
        </div>
      </div>
    </form>
  )
}
