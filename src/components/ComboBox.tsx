import type { FilterOptionsState } from '@mui/base'
import Autocomplete, { createFilterOptions } from '@mui/joy/Autocomplete'
import AutocompleteOption from '@mui/joy/AutocompleteOption'
import FormControl from '@mui/joy/FormControl'
import ListItemDecorator from '@mui/joy/ListItemDecorator'
import { fieldSurfaceSx, popupListSx } from './Search/control-styles'
import { IndexedKeywords } from '../types/common'

const filter = createFilterOptions<IndexedKeywords>()

export default function ComboBox(
  {
    className,
    options: propOptions,
    onChange,
    value: valueText,
    inputValue,
    onInputChange,
  }:
  {
    className: string,
    options: IndexedKeywords[],
    onChange: (option: IndexedKeywords) => void,
    value: IndexedKeywords | null,
    inputValue?: string,
    onInputChange?: (value: string, reason?: string) => void,
  },
) {
  return (
    <FormControl id="free-solo-with-text-demo" sx={{ width: '100%' }}>
      <Autocomplete
        className={className}
        value={valueText ?? undefined}
        inputValue={inputValue ?? ''}
        onInputChange={(_event, newInputValue, reason) => {
          onInputChange?.(newInputValue, reason)
        }}
        disableClearable
        onChange={(_event: any, newValue: any): void => {
          if (typeof newValue === 'string') { // free text
            onChange({ label: newValue, value: newValue, isCreateOption: true })
          } else if (newValue?.label && newValue?.value) { // selected keyword
            onChange(newValue)
          } else if (newValue === null) { // clear
            onChange({ label: '', value: '' })
          }
        }}
        filterOptions={(options: IndexedKeywords[], params: FilterOptionsState<IndexedKeywords>) => {
          const filtered = filter(options, params)

          const { inputValue } = params
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.value)
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              value: inputValue,
              label: `Add "${inputValue}"`,
              isCreateOption: true,
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
            {option.isCreateOption && (
              <ListItemDecorator key={`${option.label}deco`}>
                &gt; {/* TODO Insert Add icon */}
              </ListItemDecorator>
            )}
            {option.label}
          </AutocompleteOption>
        )}
        slotProps={{
          listbox: {
            sx: popupListSx,
          },
        }}
        sx={{
          width: '100%',
          '--Input-radius': '0.7rem',
          '--Input-minHeight': '2.5rem',
          '--Input-placeholderColor': 'rgba(255, 255, 255, 0.48)',
          '--Icon-color': 'rgba(255, 255, 255, 0.7)',
          '--Input-focusedThickness': '2px',
          ...fieldSurfaceSx,
          '& input': {
            color: 'rgba(255, 255, 255, 0.92)',
          },
          '& button': {
            color: 'rgba(255, 255, 255, 0.7)',
          },
          '&::before': {
            borderColor: 'rgba(255, 255, 255, 0.14)',
          },
        }}
      />
    </FormControl>
  )
}
