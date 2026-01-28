import * as React from 'react'
import {
  Box, Paper, Typography, Tabs, Tab, Chip, Stack, TextField, Button,
  Card, CardMedia, CardContent, CardActions
} from '@mui/material'
import { api } from '../../lib/api'
import { Link as RLink } from 'react-router-dom'

type Product = {
  id: string
  name: string
  price_cents?: number
  currency?: string
  store_id?: string
}

const SUB_TABS = [
  'הכל',
  'אוכל בריא',
  'אוכל ביתי',
  'ארוחות קלות',
  'דילים מהביס',
  'כל מה שהוא לא אוכל',
]

export default function HomePage() {
  const [tab, setTab] = React.useState(0)
  const [sub, setSub] = React.useState(0)
  const [q, setQ] = React.useState('')
  const [products, setProducts] = React.useState<Product[]>([])

  const load = async () => {
    const p = await api.find('products', {}, undefined)
    setProducts((p.items ?? []) as Product[])
  }

  React.useEffect(() => { load() }, [])

  const filtered = products.filter(p => (p.name ?? '').toLowerCase().includes(q.toLowerCase()))

  return (
    <Box sx={{ display:'grid', gap: 2 }}>
      {/* Hero (similar layout to screenshot, placeholders for images) */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.08)',
          bgcolor: '#f7f7f7',
          height: { xs: 220, md: 260 },
        }}
      >
        <Box
          sx={{
            position:'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 30% 30%, rgba(0,0,0,0.08), transparent 55%),' +
              'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02))',
          }}
        />
        <Box
          sx={{
            position:'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: '60%',
            bgcolor: '#fff',
            borderTopLeftRadius: '999px',
            borderTopRightRadius: '999px',
            transform: 'translateY(25%)',
          }}
        />
        <Box sx={{ position:'relative', height:'100%', display:'grid', placeItems:'center', textAlign:'center', px: 2 }}>
          <Typography sx={{ fontStyle:'italic', fontWeight: 700, fontSize: { xs: 44, md: 56 }, letterSpacing: 1 }}>
            Eat
          </Typography>
          <Typography sx={{ fontWeight: 800, mt: -1 }}>
            כיבוד ונשנושים
          </Typography>
          <Box sx={{ mt: 2, width:'min(760px, 92vw)' }}>
            <TextField
              fullWidth
              placeholder="מה לחפש לך?"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 999,
                  bgcolor:'#fff',
                }
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Primary tabs (placeholders like in screenshot) */}
      <Paper sx={{ p: 1.5 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': { fontWeight: 800, minHeight: 40 },
          }}
        >
          <Tab label="תבניות מומלצות" />
          <Tab label="Happy Hour" />
          <Tab label="מכשירי כיבוד לשימוש" />
          <Tab label="כיבודים לישיבה" />
          <Tab label="מסביב לעולם" />
          <Tab label="בקטע בריא" />
          <Tab label="עובדים עד מאוחר" />
        </Tabs>

        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap:'wrap', gap: 1 }}>
          {SUB_TABS.map((t, idx) => (
            <Chip
              key={t}
              label={t}
              clickable
              onClick={() => setSub(idx)}
              variant={sub === idx ? 'filled' : 'outlined'}
              sx={{ fontWeight: 800 }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Result count */}
      <Box sx={{ display:'flex', justifyContent:'flex-end' }}>
        <Paper sx={{ px: 2, py: 0.75, borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 900 }}>{filtered.length} תוצאות</Typography>
        </Paper>
      </Box>

      {/* Products grid */}
      <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'repeat(3, 1fr)' }, gap: 2 }}>
        {filtered.map((p) => (
          <Card key={p.id} sx={{ borderRadius: 2, overflow:'hidden' }}>
            <CardMedia
              component="div"
              sx={{
                height: 210,
                bgcolor: '#efefef',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(0,0,0,0.08), transparent 55%),' +
                  'linear-gradient(90deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02))',
              }}
            />
            <CardContent>
              <Typography sx={{ fontWeight: 900 }}>
                {p.name}
              </Typography>
              <Typography sx={{ color:'text.secondary', mt: 0.5 }}>
                מחיר: ₪ {((p.price_cents ?? 0) / 100).toFixed(2)}
              </Typography>
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2 }}>
              <Button size="small" variant="outlined" component={RLink as any} to={`/product/${p.id}`}>
                לצפייה
              </Button>
              <Box sx={{ flex: 1 }} />
              <Typography sx={{ fontWeight: 800, opacity: 0.7, fontSize: 12 }}>
                מתאימים 4–6+
              </Typography>
            </CardActions>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Paper sx={{ p: 3, gridColumn: '1 / -1' }}>
            <Typography sx={{ fontWeight: 900 }}>אין מוצרים עדיין</Typography>
            <Typography sx={{ color:'text.secondary', mt: 1 }}>
              פתח /auth/jwt/login ולחץ Seed Demo כדי ליצור נתוני דמו (עד שנחבר ל-Postgres מה-QA).
            </Typography>
            <Button sx={{ mt: 2 }} variant="contained" component={RLink as any} to="/auth/jwt/login">
              ל-Login + Seed
            </Button>
          </Paper>
        )}
      </Box>
    </Box>
  )
}
