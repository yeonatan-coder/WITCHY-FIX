
import * as React from 'react'
import { Paper, Typography } from '@mui/material'
export default function SearchPage() {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>Search</Typography>
      <Typography sx={{ color:'text.secondary' }}>Placeholder לעמוד חיפוש מתקדם (פילטרים/באנרים/תוצאות).</Typography>
    </Paper>
  )
}
