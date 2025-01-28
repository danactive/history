import { extendTheme } from '@mui/joy/styles'

export const themeMui = extendTheme({
  components: {
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
  },
})
