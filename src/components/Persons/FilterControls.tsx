import Button from '@mui/joy/Button'
import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'

import type { PersonAgeFilterValue } from '../../lib/persons'
import { pillActionButtonSx, pillSelectSx, popupListSx, selectButtonSx } from '../Search/control-styles'
import RemovableFilterChip from '../Search/RemovableFilterChip'
import styles from './filter-controls.module.css'

export type AgeCount = {
  age: number | 'unknown'
  count: number
}

export type PersonCount = {
  name: string
  count: number
}

export type FilterControlsProps = {
  agesWithCounts: AgeCount[]
  peopleAtSelectedAge: string[]
  peopleWithCounts: PersonCount[]
  selectedAge: PersonAgeFilterValue
  selectedPerson: string | null
  totalPhotoCount: number
  setSelectedAge: (value: PersonAgeFilterValue) => void
  setSelectedPerson: (value: string | null) => void
}

export default function FilterControls({
  agesWithCounts,
  peopleAtSelectedAge,
  peopleWithCounts,
  selectedAge,
  selectedPerson,
  totalPhotoCount,
  setSelectedAge,
  setSelectedPerson,
}: FilterControlsProps) {
  const hasAgeFilter = selectedAge !== null
  const hasPersonFilter = Boolean(selectedPerson)

  return (
    <div className={styles.root}>
      <div className={styles.selectRow}>
        <div className={styles.selectWrap}>
          <Select
            value={selectedAge === null ? '' : String(selectedAge)}
            onChange={(_, value) => {
              const nextAge = value === 'unknown'
                ? 'unknown'
                : (value ? Number.parseInt(value, 10) : null)
              setSelectedAge(nextAge === 'unknown' || !Number.isNaN(nextAge as number) ? nextAge : null)
            }}
            variant="soft"
            size="sm"
            sx={pillSelectSx}
            slotProps={{
              button: {
                sx: selectButtonSx,
              },
              listbox: {
                sx: popupListSx,
              },
            }}
          >
            <Option value="">
              All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
            </Option>
            {agesWithCounts.map(({ age, count }) => (
              <Option key={String(age)} value={String(age)}>
                {age === 'unknown' ? 'Unknown age' : age} ({count} {count === 1 ? 'photo' : 'photos'})
              </Option>
            ))}
          </Select>
        </div>

        {selectedAge !== null && peopleAtSelectedAge.length > 0 && (
          <div className={styles.selectWrap}>
            <Select
              value={selectedPerson ?? ''}
              onChange={(_, value) => setSelectedPerson(value || null)}
              variant="soft"
              size="sm"
              sx={pillSelectSx}
              slotProps={{
                button: {
                  sx: selectButtonSx,
                },
                listbox: {
                  sx: popupListSx,
                },
              }}
            >
              <Option value="">
                All people at {selectedAge} ({peopleAtSelectedAge.length} {peopleAtSelectedAge.length === 1 ? 'person' : 'people'})
              </Option>
              {peopleWithCounts.map(({ name, count }) => (
                <Option key={name} value={name}>
                  {name} ({count} {count === 1 ? 'photo' : 'photos'})
                </Option>
              ))}
            </Select>
          </div>
        )}

        <div className={styles.actionsRow}>
          <Button
            size="sm"
            variant="soft"
            color="primary"
            onClick={() => {
              setSelectedAge(null)
              setSelectedPerson(null)
            }}
            disabled={!hasAgeFilter && !hasPersonFilter}
            sx={pillActionButtonSx}
          >
            Clear
          </Button>
        </div>
      </div>

      {(hasAgeFilter || hasPersonFilter) && (
        <div className={styles.chipsRow}>
          {hasAgeFilter && (
            <RemovableFilterChip
              label={`Age: ${selectedAge === 'unknown' ? 'Unknown' : selectedAge}`}
              onRemove={() => {
                setSelectedAge(null)
              }}
              removeTitle="Clear age filter"
            />
          )}

          {hasPersonFilter && (
            <RemovableFilterChip
              label={`Person: ${selectedPerson}`}
              onRemove={() => setSelectedPerson(null)}
              removeTitle="Clear person filter"
            />
          )}
        </div>
      )}
    </div>
  )
}
