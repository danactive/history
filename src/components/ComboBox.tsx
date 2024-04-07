import FormControl from '@mui/joy/FormControl'
import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete'
import AutocompleteOption from '@mui/joy/AutocompleteOption'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { IndexedKeywords } from '../types/common'

const filter = createFilterOptions<IndexedKeywords>()

export default function ComboBox(
  {
    options: propOptions,
    onChange,
    value: valueText,
  }:
  {
    options: IndexedKeywords[],
    onChange: ({ label, value }: { label: string; value: string; }) => void,
    value: IndexedKeywords | null,
  },
) {
  return (
    <FormControl id="free-solo-with-text-demo">
      <Autocomplete
        value={valueText}
        onChange={(event, newValue): void => {
          if (typeof newValue === 'string') { // free text
            onChange({ label: newValue, value: newValue })
          } else if (newValue?.label && newValue?.value) { // selected keyword
            onChange({ label: newValue.label, value: newValue.value })
          } else if (newValue === null) { // clear
            onChange({ label: '', value: '' })
          }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params)

          const { inputValue } = params
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.label)
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              value: inputValue,
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
          if (option.value) {
            return option.value
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
