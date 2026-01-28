
import * as React from 'react'
import { Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, Alert, Chip } from '@mui/material'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function OrdersPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const [items, setItems] = React.useState<any[]>([])
  const [err, setErr] = React.useState<string | null>(null)

  const load = async () => {
    setErr(null)
    try {
      const res = await api.find('orders', {}, token)
      setItems(res.items)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }
  React.useEffect(() => { load() }, [])

  const approve = async (id: string) => { await api.orderApprove(id, token); await load() }
  const reject = async (id: string) => { await api.orderReject(id, token); await load() }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Orders</Typography>
        <Button variant="outlined" onClick={load}>רענן</Button>
      </Box>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      <Table sx={{ mt: 2 }}>
        <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Status</TableCell><TableCell>Store</TableCell><TableCell>Actions</TableCell></TableRow></TableHead>
        <TableBody>
          {items.map((o) => (
            <TableRow key={o.id} hover>
              <TableCell>{o.id}</TableCell>
              <TableCell><Chip size="small" label={o.status} /></TableCell>
              <TableCell>{o.store_id}</TableCell>
              <TableCell>
                <Box sx={{ display:'flex', gap: 1 }}>
                  <Button size="small" variant="contained" onClick={() => approve(o.id)} disabled={o.status !== 'pending'}>Approve</Button>
                  <Button size="small" variant="outlined" onClick={() => reject(o.id)} disabled={o.status !== 'pending'}>Reject</Button>
                </Box>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && <TableRow><TableCell colSpan={4}>אין הזמנות עדיין. צור דרך Checkout.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  )
}
