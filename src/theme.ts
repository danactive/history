import { extendTheme } from '@mui/joy/styles'
import { mapMarkerUi } from './components/SlippyMap/marker-theme'

export const themeMui = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        focusVisible: mapMarkerUi.primary,
      },
    },
    light: {
      palette: {
        focusVisible: mapMarkerUi.primary,
      },
    },
  },
  components: {
    JoyLink: {
      styleOverrides: {
        root: {
          // Text needs the lightest marker tone on the charcoal surface.
          // Reserve the darker cluster stops for filled and pressed controls.
          '--variant-outlinedBorder': mapMarkerUi.primary,
          color: mapMarkerUi.subtle,
          textDecorationColor: mapMarkerUi.primary,
          '&:hover': {
            '--variant-outlinedBorder': mapMarkerUi.hover,
            color: mapMarkerUi.subtle,
            textDecorationColor: mapMarkerUi.hover,
            textDecorationThickness: '2px',
          },
          '&:active': {
            color: mapMarkerUi.primary,
          },
          '&:visited': {
            color: mapMarkerUi.subtle,
          },
          '&:visited:hover': {
            '--variant-outlinedBorder': mapMarkerUi.hover,
            color: mapMarkerUi.subtle,
            textDecorationColor: mapMarkerUi.hover,
            textDecorationThickness: '2px',
          },
        },
      },
    },
    JoyListDivider: {
      defaultProps: {
        inset: 'gutter',
      },
      styleOverrides: {
        root: {
          backgroundColor: 'silver',
        },
      },
    },
    JoyList: {
      styleOverrides: {
        root: {
          border: '1px solid silver',
          borderRadius: '3px',
          backgroundColor: '#545454',
          color: 'red',
        },
      },
    },
    JoyListItem: {
      styleOverrides: {
        root: {
          color: '#C0C0C0',
        },
      },
    },
    JoyTextarea: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: '#C0C0C0',
          backgroundColor: '#545454',
          fontSize: theme.vars.fontSize.md,
        }),
      },
    },
  },
})

export default themeMui
