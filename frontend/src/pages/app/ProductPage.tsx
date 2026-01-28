
import * as React from 'react'
import { Paper, Typography, Box, Button, Alert } from '@mui/material'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { useCart } from '../../lib/cart'

export default function ProductPage() {
  const { catalogueId } = useParams()
  const [p, setP] = React.useState<any>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const { add } = useCart()

  React.useEffect(() => {
    (async () => {
      try {
        const prod = await api.getById('products', catalogueId!, undefined)
        setP(prod)
      } catch (e: any) {
        setErr(e?.message ?? 'Failed')
      }
    })()
  }, [catalogueId])

  return (
    <Paper sx={{ p: 3 }}>
      {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
      <Typography variant="h5" sx={{ fontWeight: 900 }}>{p?.name ?? 'Product'}</Typography>
      <Typography sx={{ color:'text.secondary', mb: 2 }}>₪ {(p?.price_cents ?? 0)/100}</Typography>
      <Button variant="contained" disabled={!p} onClick={() => add({ product_id: p.id, name: p.name, price_cents: p.price_cents ?? 0, store_id: p.store_id }, 1)}>
        הוסף לעגלה
      </Button>
    </Paper>
  )
}
