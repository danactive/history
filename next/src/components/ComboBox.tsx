import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete'
import AutocompleteOption from '@mui/joy/AutocompleteOption'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { IndexedKeywords, FilmOptionType } from '../types/common'

export const TYPES = {
  A: 'A',
  B: 'B',
  C: 'C',
} as const

const filter = createFilterOptions<FilmOptionType>()

export default function ComboBox(
  {
    options: propOptions,
    onChange,
    value: valueText,
  }:
  {
    options: FilmOptionType[],
    onChange: ({ value, label, type }: { value: string; label: string; type: keyof typeof TYPES, }) => void,
    value: FilmOptionType | null,
  },
) {
  return (
    <FormControl id="free-solo-with-text-demo">
      <Autocomplete
        value={valueText}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            console.log('1newValue', newValue)
            onChange({ value: newValue, label: newValue, type: TYPES.A })
          } else if (newValue && newValue.inputValue) {
            console.log('2newValue', newValue.inputValue)
            onChange({ value: newValue.inputValue, label: newValue.inputValue, type: TYPES.B })
          } else {
            console.log('3newValue', newValue?.value)
            onChange({ ...newValue, type: TYPES.C })
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params)

          const { inputValue } = params
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.label)
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              inputValue,
              label: `Add "${inputValue}"`,
            })
          }

          return filtered
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        freeSolo
        options={propOptions}
        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option
          }
          // Add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue
          }
          // Regular option
          return option.label
        }}
        renderOption={(props, option) => (
          <AutocompleteOption {...props}>
            {option.label?.startsWith('Add "') && (
              <ListItemDecorator>
                Add icon
              </ListItemDecorator>
            )}
            {option.label}
          </AutocompleteOption>
        )}
        sx={{ width: 300 }}
      />
    </FormControl>
  )
}
