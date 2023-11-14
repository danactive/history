import * as React from 'react'
import FormControl from '@mui/joy/FormControl'
import FormLabel from '@mui/joy/FormLabel'
import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete'
import AutocompleteOption from '@mui/joy/AutocompleteOption'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { IndexedKeywords } from '../types/common'

interface FilmOptionType extends Partial<IndexedKeywords> {
  inputValue?: string;
  label: string;
}

const filter = createFilterOptions<FilmOptionType>()

export default function FreeSoloCreateOption({ options: propOptions }: { options: FilmOptionType[] }) {
  const [value, setValue] = React.useState<FilmOptionType | null>(null)

  return (
    <FormControl id="free-solo-with-text-demo">
      <FormLabel>Free solo with text demo</FormLabel>
      <Autocomplete
        value={value}
        onChange={(event, newValue) => {
          if (typeof newValue === 'string') {
            setValue({
              label: newValue,
            })
          } else if (newValue && newValue.inputValue) {
            // Create a new value from the user input
            setValue({
              label: newValue.inputValue,
            })
          } else {
            setValue(newValue)
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
