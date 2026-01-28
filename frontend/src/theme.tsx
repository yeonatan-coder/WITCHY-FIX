
import React from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'

const theme = createTheme({
  direction: 'rtl',
  palette: {
    mode: 'light',
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#111111', secondary: '#444444' },
    primary: { main: '#111111' },
  },
  typography: { fontFamily: ['Arial','system-ui','sans-serif'].join(',') },
  shape: { borderRadius: 14 },
  components: {
    MuiPaper: { styleOverrides: { root: { border: '1px solid rgba(0,0,0,0.08)' } } },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: 12 } } },
  },
})

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>
}
