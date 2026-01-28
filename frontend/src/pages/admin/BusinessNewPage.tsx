
import * as React from 'react'
import { Paper, Typography, Box, TextField, Button, Alert } from '@mui/material'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function BusinessNewPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const nav = useNavigate()
  const [name, setName] = React.useState('My Store')
  const [catName, setCatName] = React.useState('Category A')
  const [prodName, setProdName] = React.useState('Product A')
  const [price, setPrice] = React.useState(4500)
  const [err, setErr] = React.useState<string | null>(null)

  const onCreate = async () => {
    setErr(null)
    try {
      const res = await api.storeWizard({
        store: { name, currency: 'ILS' },
        categories: [{ name: catName, products: [{ name: prodName, price_cents: price, currency: 'ILS', stock_qty: 10, low_stock_threshold: 3 }] }]
      }, token)
      nav(`/businesses/${res.store.id}/products`)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>Create Business Wizard</Typography>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      <Box sx={{ display:'grid', gap: 2, mt: 2, maxWidth: 560 }}>
        <TextField label="Store name" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} />
        <TextField label="Product name" value={prodName} onChange={(e) => setProdName(e.target.value)} />
        <TextField label="Price (cents)" type="number" value={price} onChange={(e) => setPrice(parseInt(e.target.value || '0', 10))} />
        <Button variant="contained" onClick={onCreate}>Create</Button>
      </Box>
    </Paper>
  )
}
