
import * as React from 'react'
import { Paper, Typography, Box, Button, Alert, List, ListItem, ListItemText } from '@mui/material'
import { useCart } from '../../lib/cart'
import { useAuth } from '../../lib/auth'
import { api } from '../../lib/api'

export default function CheckoutPage() {
  const { items, totalCents, clear, storeId } = useCart()
  const { auth } = useAuth()
  const token = auth?.token
  const [ok, setOk] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)

  const place = async () => {
    setOk(null); setErr(null)
    try {
      if (!token) throw new Error('צריך להתחבר כדי לבצע הזמנה')
      if (!storeId) throw new Error('אין store_id בעגלה')
      const o = await api.ordersCreate({
        store_id: storeId,
        line_items: items.map(i => ({ product_id: i.product_id, qty: i.qty }))
      }, token)
      setOk(`Order created: ${o.id} (status: ${o.status})`)
      clear()
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 900 }}>Checkout</Typography>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      {ok && <Alert severity="success" sx={{ mt: 2 }}>{ok}</Alert>}
      <List sx={{ mt: 2 }}>
        {items.map(it => (
          <ListItem key={it.product_id}>
            <ListItemText primary={`${it.name} × ${it.qty}`} secondary={`₪ ${(it.price_cents * it.qty)/100}`} />
          </ListItem>
        ))}
        {items.length === 0 && <Typography sx={{ color:'text.secondary' }}>אין פריטים בעגלה.</Typography>}
      </List>
      <Typography sx={{ fontWeight: 900 }}>סה״כ: ₪ {totalCents/100}</Typography>
      <Box sx={{ mt: 2 }}>
        <Button variant="contained" disabled={!items.length} onClick={place}>בצע הזמנה</Button>
      </Box>
    </Paper>
  )
}
