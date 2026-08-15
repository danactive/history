import Option from '@mui/joy/Option'
import Select from '@mui/joy/Select'

import type { PersonAgeFilterValue } from '../../lib/persons'
import { pillSelectSx, popupListSx, selectButtonSx } from '../Search/control-styles'
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

        {people.length > 0 && (
          <div className={styles.selectWrap}>
            <Select
              value={selectedPerson ?? ''}
              renderValue={() => personButtonLabel}
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
                {allPersonsLabel}
              </Option>
              {peopleWithCounts.map(({ name, count }) => (
                <Option key={name} value={name}>
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
