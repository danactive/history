import type { FilterOptionsState } from '@mui/base'
import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete'
import AutocompleteOption from '@mui/joy/AutocompleteOption'
import FormControl from '@mui/joy/FormControl'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { IndexedKeywords } from '../types/common'

const filter = createFilterOptions<IndexedKeywords>()

export default function ComboBox(
  {
    className,
    options: propOptions,
    onChange,
    value: valueText,
  }:
  {
    className: string,
    options: IndexedKeywords[],
    onChange: ({ label, value }: { label: string; value: string; }) => void,
    value: IndexedKeywords | null,
  },
) {
  return (
    <FormControl id="free-solo-with-text-demo">
      <Autocomplete
        className={className}
        value={valueText}
        disableClearable
        onChange={(_event: any, newValue: any): void => {
          if (typeof newValue === 'string') { // free text
            onChange({ label: newValue, value: newValue })
          } else if (newValue?.label && newValue?.value) { // selected keyword
            onChange({ label: newValue.label, value: newValue.value })
          } else if (newValue === null) { // clear
            onChange({ label: '', value: '' })
          }
        }}
        filterOptions={(options: IndexedKeywords[], params: FilterOptionsState<IndexedKeywords>) => {
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
        getOptionLabel={(option: string | { value: any; label: any }) => {
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
          <AutocompleteOption {...props} key={option.label}>
            {option.label?.startsWith('Add "') && (
              <ListItemDecorator key={`${option.label}deco`}>
                &gt; {/* TODO Insert Add icon */}
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
