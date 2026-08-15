import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'

import type { PersonAgeFilterValue } from '../../lib/persons'
import { pillSelectSx, popupListSx, selectButtonSx } from '../Search/control-styles'
import styles from './filter-controls.module.css'

const darkSelectSx = {
  ...pillSelectSx,
  '--variant-softBg': 'rgba(26, 30, 36, 0.92)',
  '--variant-softHoverBg': 'rgba(38, 43, 50, 0.96)',
  '--variant-softActiveBg': 'rgba(44, 49, 57, 0.98)',
  '&:hover, &:focus-within, &.MuiSelect-expanded': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderColor: 'transparent',
  },
} as const

const darkSelectButtonSx = {
  ...selectButtonSx,
  backgroundColor: 'rgba(26, 30, 36, 0.92)',
  color: 'rgba(255, 255, 255, 0.92)',
  '&:hover, &:focus-visible, &[aria-expanded="true"]': {
    backgroundColor: 'rgba(38, 43, 50, 0.96) !important',
    color: 'rgba(255, 255, 255, 0.96)',
  },
} as const

const darkOptionSx = {
  '--variant-plainColor': 'rgba(255, 255, 255, 0.92)',
  '--variant-plainHoverColor': 'rgba(255, 255, 255, 0.96)',
  '--variant-plainHoverBg': 'rgba(52, 58, 68, 0.98)',
  '--variant-plainActiveColor': 'rgba(255, 255, 255, 0.98)',
  '--variant-plainActiveBg': 'rgba(71, 113, 129, 0.62)',
  color: 'rgba(255, 255, 255, 0.92)',
  '&:hover, &.MuiOption-highlighted:not([aria-selected="true"])': {
    backgroundColor: 'rgba(52, 58, 68, 0.98) !important',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '&[aria-selected="true"], &[aria-selected="true"]:hover': {
    backgroundColor: 'rgba(71, 113, 129, 0.68) !important',
    color: 'rgba(255, 255, 255, 0.98)',
  },
} as const

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
  people: string[]
  peopleWithCounts: PersonCount[]
  selectedAge: PersonAgeFilterValue
  selectedPerson: string | null
  totalPhotoCount: number
  setSelectedAge: (value: PersonAgeFilterValue) => void
  setSelectedPerson: (value: string | null) => void
}

export default function FilterControls({
  agesWithCounts,
  people,
  peopleWithCounts,
  selectedAge,
  selectedPerson,
  totalPhotoCount,
  setSelectedAge,
  setSelectedPerson,
}: FilterControlsProps) {
  const selectedAgeCount = selectedAge === null
    ? totalPhotoCount
    : agesWithCounts.find(({ age }) => age === selectedAge)?.count ?? 0
  const ageButtonLabel = selectedAge === null
    ? `All ages (${totalPhotoCount} ${totalPhotoCount === 1 ? 'photo' : 'photos'})`
    : `${selectedAge === 'unknown' ? 'Unknown age' : selectedAge} (${selectedAgeCount} ${selectedAgeCount === 1 ? 'photo' : 'photos'})`

  const selectedPersonCount = selectedPerson
    ? peopleWithCounts.find(({ name }) => name === selectedPerson)?.count ?? 0
    : people.length
  const peopleLabel = `${people.length} ${people.length === 1 ? 'person' : 'persons'}`
  const allPersonsLabel = `All persons (${peopleLabel})`
  const personButtonLabel = selectedPerson
    ? `${selectedPerson} (${selectedPersonCount} ${selectedPersonCount === 1 ? 'photo' : 'photos'})`
    : allPersonsLabel

  return (
    <div className={styles.root}>
      <div className={styles.selectRow}>
        <div className={styles.selectWrap}>
          <Select
            value={selectedAge === null ? '' : String(selectedAge)}
            renderValue={() => ageButtonLabel}
            onChange={(_, value) => {
              const nextAge = value === 'unknown'
                ? 'unknown'
                : (value ? Number.parseInt(value, 10) : null)
              setSelectedAge(nextAge === 'unknown' || (typeof nextAge === 'number' && nextAge >= 0) ? nextAge : null)
            }}
            variant="soft"
            size="sm"
            sx={darkSelectSx}
            slotProps={{
              button: {
                sx: darkSelectButtonSx,
              },
              listbox: {
                sx: popupListSx,
              },
            }}
          >
            <Option value="" sx={darkOptionSx}>
              All ages ({totalPhotoCount} {totalPhotoCount === 1 ? 'photo' : 'photos'})
            </Option>
            {agesWithCounts.map(({ age, count }) => (
              <Option key={String(age)} value={String(age)} sx={darkOptionSx}>
                {age === 'unknown' ? 'Unknown age' : age} ({count} {count === 1 ? 'photo' : 'photos'})
              </Option>
            ))}
          </Select>
        </div>

        {people.length > 0 && (
          <div className={styles.selectWrap}>
            <Select
              value={selectedPerson ?? ''}
              renderValue={() => personButtonLabel}
              onChange={(_, value) => setSelectedPerson(value || null)}
              variant="soft"
              size="sm"
              sx={darkSelectSx}
              slotProps={{
                button: {
                  sx: darkSelectButtonSx,
                },
                listbox: {
                  sx: popupListSx,
                },
              }}
            >
              <Option value="" sx={darkOptionSx}>
                {allPersonsLabel}
              </Option>
              {peopleWithCounts.map(({ name, count }) => (
                <Option key={name} value={name} sx={darkOptionSx}>
                  {name} ({count} {count === 1 ? 'photo' : 'photos'})
                </Option>
              ))}
            </Select>
          </div>
        )}
      </div>
    </div>
  )
}
