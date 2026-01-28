
import * as React from 'react'
import { Paper, Typography, Box, Button, Table, TableBody, TableCell, TableHead, TableRow, Alert } from '@mui/material'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { Link as RLink } from 'react-router-dom'

export default function BusinessesPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const [items, setItems] = React.useState<any[]>([])
  const [err, setErr] = React.useState<string | null>(null)

  const load = async () => {
    setErr(null)
    try {
      const res = await api.find('stores', {}, token)
      setItems(res.items)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load')
    }
  }

  React.useEffect(() => { load() }, [])

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Businesses</Typography>
        <Box sx={{ display:'flex', gap: 1 }}>
          <Button variant="outlined" onClick={load}>רענן</Button>
          <Button variant="contained" component={RLink as any} to="/businesses/new">צור חנות (Wizard)</Button>
        </Box>
      </Box>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      <Table sx={{ mt: 2 }}>
        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>שם</TableCell><TableCell>Owner</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {items.map((s) => (
            <TableRow key={s.id} hover>
              <TableCell>{s.id}</TableCell>
              <TableCell>{s.name ?? '(no name)'}</TableCell>
              <TableCell>{s.owner_user_id ?? '-'}</TableCell>
              <TableCell><Button size="small" component={RLink as any} to={`/businesses/${s.id}/products`}>Products</Button></TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={4}>אין חנויות עדיין. לחץ Seed Demo.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  )
}
