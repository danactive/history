export const filterChipSx = {
  '--Chip-radius': '0.7rem',
  '--Chip-paddingInline': '0.55rem',
  '--variant-softColor': 'var(--map-marker-subtle)',
  '--variant-softBg': 'color-mix(in srgb, var(--map-marker-active) 34%, transparent)',
  '--variant-softHoverBg': 'color-mix(in srgb, var(--map-marker-active) 48%, transparent)',
  '--variant-softActiveBg': 'color-mix(in srgb, var(--map-marker-pressed) 60%, transparent)',
  '--variant-outlinedColor': 'var(--map-marker-subtle)',
  '--variant-outlinedBorder': 'var(--map-marker-primary)',
  '--variant-outlinedHoverBg': 'color-mix(in srgb, var(--map-marker-active) 32%, transparent)',
  '--variant-outlinedActiveBg': 'color-mix(in srgb, var(--map-marker-pressed) 46%, transparent)',
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

export const markerActionButtonSx = {
  ...pillActionButtonSx,
  '--variant-softColor': '#fff',
  '--variant-softBg': 'var(--map-marker-active)',
  '--variant-softHoverBg': 'var(--map-marker-hover)',
  '--variant-softActiveBg': 'var(--map-marker-pressed)',
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
  '--Select-focusedHighlight': 'color-mix(in srgb, var(--map-marker-primary) 48%, transparent)',
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
  '--ListItemDecorator-color': 'var(--map-marker-primary)',
  '--variant-plainColor': 'rgba(255, 255, 255, 0.92)',
  '--variant-plainHoverColor': 'rgba(255, 255, 255, 0.96)',
  '--variant-plainHoverBg': 'rgba(52, 58, 68, 0.98)',
  '--variant-plainActiveColor': 'rgba(255, 255, 255, 0.98)',
  '--variant-plainActiveBg': 'color-mix(in srgb, var(--map-marker-active) 55%, transparent)',
  '& [role="option"]': {
    color: 'rgba(255, 255, 255, 0.92)',
    borderRadius: '0.55rem',
    backgroundColor: 'transparent',
  },
  '& .MuiOption-root.MuiOption-highlighted:not([aria-selected="true"])': {
    backgroundColor: 'rgba(52, 58, 68, 0.98)',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '& [role="option"][aria-selected="true"]': {
    backgroundColor: 'color-mix(in srgb, var(--map-marker-active) 45%, transparent)',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '& [role="option"]:hover, & [role="option"].Mui-focused': {
    backgroundColor: 'rgba(52, 58, 68, 0.98)',
    color: 'rgba(255, 255, 255, 0.96)',
  },
  '& [role="option"][aria-selected="true"]:hover, & [role="option"][aria-selected="true"].Mui-focused': {
    backgroundColor: 'color-mix(in srgb, var(--map-marker-active) 62%, transparent)',
    color: 'rgba(255, 255, 255, 0.98)',
  },
} as const
