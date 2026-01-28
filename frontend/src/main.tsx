import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CssBaseline } from '@mui/material'
import { AppThemeProvider } from './theme'
import { AuthProvider } from './lib/auth'
import { CartProvider } from './lib/cart'
import AppRouter from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppThemeProvider>
            <CssBaseline />
            <AppRouter />
          </AppThemeProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
