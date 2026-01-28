
import * as React from 'react'
import { Paper, Typography, Box, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField, Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function BusinessProductsPage() {
  const { businessId } = useParams()
  const { auth } = useAuth()
  const token = auth?.token
  const [products, setProducts] = React.useState<any[]>([])
  const [name, setName] = React.useState('New Product')
  const [price, setPrice] = React.useState(1000)
  const [err, setErr] = React.useState<string | null>(null)

  const load = async () => {
    setErr(null)
    try {
      const pr = await api.find('products', { store_id: businessId }, token)
      setProducts(pr.items)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }
  React.useEffect(() => { if (businessId) load() }, [businessId])

  const add = async () => {
    setErr(null)
    try {
      const created = await api.create('products', { store_id: businessId, name, price_cents: price, currency: 'ILS', stock_qty: 0, low_stock_threshold: 3 }, token)
      setProducts([created, ...products])
      setName('New Product'); setPrice(1000)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>Products</Typography>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      <Box sx={{ display:'flex', gap: 1, mt: 2, flexWrap:'wrap' }}>
        <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Price (cents)" type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} />
        <Button variant="contained" onClick={add}>Add</Button>
        <Button variant="outlined" onClick={load}>Refresh</Button>
      </Box>
      <Table sx={{ mt: 2 }}>
        <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell></TableRow></TableHead>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id} hover><TableCell>{p.name}</TableCell><TableCell>₪ {(p.price_cents ?? 0)/100}</TableCell><TableCell>{p.stock_qty ?? 0}</TableCell></TableRow>
          ))}
          {products.length === 0 && <TableRow><TableCell colSpan={3}>אין מוצרים עדיין.</TableCell></TableRow>}
        </TableBody>
      </Table>
    </Paper>
  )
}
