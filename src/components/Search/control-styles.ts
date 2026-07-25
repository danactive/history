export const filterChipSx = {
  '--Chip-radius': '0.7rem',
  '--Chip-paddingInline': '0.55rem',
  fontWeight: 600,
  backdropFilter: 'blur(6px)',
} as const

export const dismissButtonSx = {
  minWidth: '1.7rem',
  width: '1.7rem',
  height: '1.7rem',
  borderRadius: '0.55rem',
  color: 'rgba(255, 255, 255, 0.72)',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
} as const

export const pillActionButtonSx = {
  borderRadius: '0.7rem',
  px: 1.2,
  fontWeight: 600,
} as const

export const fieldSurfaceSx = {
  borderRadius: '0.7rem',
  minHeight: '2.4rem',
  color: 'rgba(255, 255, 255, 0.92)',
  backgroundColor: 'rgba(26, 30, 36, 0.92)',
  borderColor: 'rgba(255, 255, 255, 0.14)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.03)',
  '&:hover': {
    backgroundColor: 'rgba(38, 43, 50, 0.96)',
  },
} as const

export const pillSelectSx = {
  width: '100%',
  borderRadius: '0.7rem',
  minHeight: '2.4rem',
  '--Select-paddingInline': '0px',
  '--_Select-paddingBlock': '0px',
  p: 0,
  paddingInline: 0,
  paddingBlock: 0,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderColor: 'transparent',
  '--Select-focusedHighlight': 'rgba(108, 192, 229, 0.35)',
  '&::before': {
    display: 'none',
  },
  '&:hover, &:focus-within, &.MuiSelect-expanded': {
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderColor: 'transparent',
  },
} as const

export const selectButtonSx = {
  ...fieldSurfaceSx,
  px: 1,
  pr: 1.75,
  '--Icon-color': 'rgba(255, 255, 255, 0.7)',
  '--variant-softBg': 'rgba(26, 30, 36, 0.92)',
  '--variant-softHoverBg': 'rgba(38, 43, 50, 0.96)',
  '--variant-softActiveBg': 'rgba(44, 49, 57, 0.98)',
  '&:hover': {
    backgroundColor: 'rgba(38, 43, 50, 0.96)',
  },
  '&:focus-visible, &[aria-expanded="true"]': {
    backgroundColor: 'rgba(38, 43, 50, 0.96)',
  },
  '& .MuiSelect-indicator': {
    color: 'rgba(255, 255, 255, 0.7)',
    backgroundColor: 'transparent',
    boxShadow: 'none',
    borderRadius: 0,
    paddingInline: 0,
    marginRight: 0,
  },
  '& .MuiSelect-indicator svg': {
    fill: 'currentColor',
  },
} as const

export const popupListSx = {
  borderRadius: '0.8rem',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  backgroundColor: 'rgba(24, 28, 34, 0.98)',
  color: 'rgba(255, 255, 255, 0.92)',
  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.35)',
  '--ListItemDecorator-color': 'rgba(108, 192, 229, 0.9)',
  '& [role="option"]': {
    color: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '0.55rem',
    backgroundColor: 'transparent',
  },
  '& [role="option"][aria-selected="true"]': {
    backgroundColor: 'rgba(108, 192, 229, 0.18)',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '& [role="option"]:hover, & [role="option"].Mui-focused': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '& [role="option"][aria-selected="true"]:hover, & [role="option"][aria-selected="true"].Mui-focused': {
    backgroundColor: 'rgba(108, 192, 229, 0.24)',
    color: 'rgba(255, 255, 255, 0.98)',
  },
} as const
