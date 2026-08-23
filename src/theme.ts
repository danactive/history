import { extendTheme } from '@mui/joy/styles'
import { mapMarkerUi } from './components/SlippyMap/marker-theme'

const markerPrimaryScale = {
  50: mapMarkerUi.subtle,
  100: mapMarkerUi.subtle,
  200: mapMarkerUi.primary,
  300: mapMarkerUi.primary,
  400: mapMarkerUi.primary,
  500: mapMarkerUi.active,
  600: mapMarkerUi.hover,
  700: mapMarkerUi.pressed,
  800: mapMarkerUi.active,
  900: mapMarkerUi.visited,
  mainChannel: '198 40 40',
  lightChannel: '255 204 203',
  darkChannel: '158 27 53',
} as const

const markerSolidButton = {
  solidColor: '#fff',
  solidBg: mapMarkerUi.active,
  solidHoverBg: mapMarkerUi.hover,
  solidActiveBg: mapMarkerUi.pressed,
} as const

const markerMix = (color: string, percentage: number, background = 'transparent') =>
  `color-mix(in srgb, ${color} ${percentage}%, ${background})`

export const themeMui = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        focusVisible: mapMarkerUi.primary,
        primary: {
          ...markerPrimaryScale,
          ...markerSolidButton,
          plainColor: mapMarkerUi.subtle,
          plainHoverBg: markerMix(mapMarkerUi.active, 32),
          plainActiveBg: markerMix(mapMarkerUi.pressed, 46),
          outlinedColor: mapMarkerUi.subtle,
          outlinedBorder: mapMarkerUi.primary,
          outlinedHoverBg: markerMix(mapMarkerUi.active, 32),
          outlinedActiveBg: markerMix(mapMarkerUi.pressed, 46),
          softColor: mapMarkerUi.subtle,
          softBg: markerMix(mapMarkerUi.active, 34),
          softHoverBg: markerMix(mapMarkerUi.active, 48),
          softActiveBg: markerMix(mapMarkerUi.pressed, 60),
        },
      },
    },
    light: {
      palette: {
        focusVisible: mapMarkerUi.primary,
        primary: {
          ...markerPrimaryScale,
          ...markerSolidButton,
          plainColor: mapMarkerUi.active,
          plainHoverBg: markerMix(mapMarkerUi.active, 12, 'white'),
          plainActiveBg: markerMix(mapMarkerUi.active, 20, 'white'),
          outlinedColor: mapMarkerUi.active,
          outlinedBorder: mapMarkerUi.primary,
          outlinedHoverBg: markerMix(mapMarkerUi.active, 12, 'white'),
          outlinedActiveBg: markerMix(mapMarkerUi.active, 20, 'white'),
          softColor: mapMarkerUi.visited,
          softBg: markerMix(mapMarkerUi.active, 12, 'white'),
          softHoverBg: markerMix(mapMarkerUi.active, 20, 'white'),
          softActiveBg: markerMix(mapMarkerUi.active, 28, 'white'),
        },
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
            color: mapMarkerUi.primary,
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
