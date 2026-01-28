
import * as React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import { TopNav } from '../components/TopNav'

export default function MainLayout() {
  return (
    <Box sx={{ minHeight:'100vh', bgcolor:'background.default' }}>
      <TopNav />
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx:'auto' }}>
        <Outlet />
      </Box>
    </Box>
  )
}
