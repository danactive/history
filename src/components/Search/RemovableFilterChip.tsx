import Button from '@mui/joy/Button'
import Chip from '@mui/joy/Chip'
import Stack from '@mui/joy/Stack'

import { dismissButtonSx, filterChipSx } from './control-styles'

type Props = {
  label: React.ReactNode
  onRemove: () => void
  removeTitle: string
  removeAriaLabel?: string
  className?: string
  variant?: 'soft' | 'outlined' | 'solid' | 'plain'
}

export default function RemovableFilterChip({
  label,
  onRemove,
  removeTitle,
  removeAriaLabel,
  className,
  variant = 'soft',
}: Props) {
  return (
    <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }} className={className}>
      <Chip size="sm" color="primary" variant={variant} sx={filterChipSx}>
        {label}
      </Chip>
      <Button
        type="button"
        size="sm"
        variant="plain"
        onClick={onRemove}
        title={removeTitle}
        aria-label={removeAriaLabel ?? removeTitle}
        sx={dismissButtonSx}
      >
        ×
      </Button>
    </Stack>
  )
}
