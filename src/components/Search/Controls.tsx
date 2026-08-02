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
  activeTag?: string | null
  activeYear?: string | null
  parsedKeyword: ParsedKeywordQuery
  activeVisitedFilterLabel: string | null | undefined
  mapFilterEnabled?: boolean
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
  onClearTag: () => void
  onClearYear: () => void
  onClearVisitedFilter: () => void
  onClearMapFilter?: (coordinates?: [number, number] | null) => void
  extraFilterChips?: React.ReactNode
  extraFiltersActive?: boolean
  onClearAll?: () => void
  clearActionLabel?: string
  clearActionTitle?: string
}

export default function Controls({
  summaryLabel = 'Search results',
  visibleCount,
  totalCount,
  keyword,
  activeTag,
  activeYear,
  parsedKeyword,
  activeVisitedFilterLabel,
  mapFilterEnabled,
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
  onClearTag,
  onClearYear,
  onClearVisitedFilter,
  onClearMapFilter,
  extraFilterChips,
  extraFiltersActive = false,
  onClearAll,
  clearActionLabel = 'Clear',
  clearActionTitle = 'Clear search and view adjacent photos',
}: Props) {
  const keywordResultLabel = activeYear
    ? <> for year &quot;{activeYear}&quot;</>
    : activeTag
    ? <> for tag &quot;{activeTag}&quot;</>
    : keyword ? <> for &quot;{keyword}&quot;</> : null
  const hasActiveFilters = Boolean(keyword || activeTag || activeYear || activeVisitedFilterLabel || mapFilterEnabled || extraFiltersActive)

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
              {activeYear ? (
                <RemovableFilterChip
                  className={styles.filterToken}
                  label={`Year: ${activeYear}`}
                  onRemove={onClearYear}
                  removeTitle={`Clear year filter ${activeYear}`}
                />
              ) : activeTag ? (
                <RemovableFilterChip
                  className={styles.filterToken}
                  label={`Tag: ${activeTag}`}
                  onRemove={onClearTag}
                  removeTitle={`Clear tag filter ${activeTag}`}
                />
              ) : keyword && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  {parsedKeyword.mode && (
                    <Chip size="sm" color="primary" variant="outlined" sx={filterChipSx}>
                      {parsedKeyword.mode}
                    </Chip>
                  )}
                  {parsedKeyword.isAdvanced ? (
                    <RemovableFilterChip
                      className={styles.filterToken}
                      label="Advanced query"
                      onRemove={onClear}
                      removeTitle="Clear search and view adjacent photos"
                      removeAriaLabel="Clear advanced query"
                    />
                  ) : (
                    parsedKeyword.tokens.map((token, idx) => (
                      <RemovableFilterChip
                        key={`${token}-${idx}`}
                        className={styles.filterToken}
                        label={token}
                        onRemove={() => onRemoveKeywordToken(idx)}
                        removeTitle={`Remove keyword token ${token}`}
                      />
                    ))
                  )}
                </Stack>
              )}
              {activeVisitedFilterLabel && (
                <RemovableFilterChip
                  className={styles.filterToken}
                  label={activeVisitedFilterLabel}
                  onRemove={onClearVisitedFilter}
                  removeTitle={`Clear visited filter ${activeVisitedFilterLabel}`}
                />
              )}
              {mapFilterEnabled && (
                <RemovableFilterChip
                  className={styles.filterToken}
                  label="Map filter"
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
              title="`&&` is AND; `||` is OR; for example `breakfast||lunch`"
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
