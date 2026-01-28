
import * as React from 'react'
import { Outlet, Link as RLink, Navigate } from 'react-router-dom'
import { Box, Paper, Typography, Divider } from '@mui/material'
import { TopNav } from '../components/TopNav'
import { useAuth } from '../lib/auth'

export default function AdminLayout() {
  const { auth } = useAuth()
  const role = auth?.user?.role ?? 'guest'
  if (role !== 'admin' && role !== 'owner') return <Navigate to="/auth/jwt/login" replace />

  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'background.default' }}>
      <TopNav />
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1300, mx:'auto', display:'grid', gridTemplateColumns:{ xs:'1fr', md:'280px 1fr' }, gap: 2 }}>
        <Paper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 900, mb: 1 }}>ניהול</Typography>
          <Divider sx={{ mb: 1 }} />
          <Box sx={{ display:'grid', gap: 1 }}>
            <RLink to="/businesses" style={{ textDecoration:'none', color:'inherit' }}>Businesses</RLink>
            <RLink to="/businesses/new" style={{ textDecoration:'none', color:'inherit' }}>Wizard</RLink>
            <RLink to="/orders" style={{ textDecoration:'none', color:'inherit' }}>Orders</RLink>
            <RLink to="/system/settings" style={{ textDecoration:'none', color:'inherit' }}>System Settings</RLink>
          </Box>
        </Paper>
        <Box><Outlet /></Box>
      </Box>
    </Box>
  )
}
