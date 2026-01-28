
import * as React from 'react'
import { AppBar, Toolbar, Box, IconButton, Typography, MenuItem, Select, InputBase, Drawer, Divider, Button, Badge, List, ListItem, ListItemText } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import WalletOutlinedIcon from '@mui/icons-material/WalletOutlined'
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'
import CloseIcon from '@mui/icons-material/Close'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../lib/auth'
import { useCart } from '../lib/cart'
import { api } from '../lib/api'
import { Link as RLink, useNavigate } from 'react-router-dom'

export function TopNav() {
  const [brand, setBrand] = React.useState('WITCHY')
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [cartOpen, setCartOpen] = React.useState(false)
  const [walletOpen, setWalletOpen] = React.useState(false)
  const [notifOpen, setNotifOpen] = React.useState(false)
  const [notifs, setNotifs] = React.useState<any[]>([])

  const { auth, logout, seedDemo } = useAuth()
  const { items, totalCents, remove, clear } = useCart()
  const nav = useNavigate()
  const role = auth?.user?.role ?? 'guest'
  const token = auth?.token

  const unseen = notifs.filter(n => !n.seen).length

  const loadNotifs = React.useCallback(async () => {
    if (!token) return
    const res = await api.notifFind({}, token)
    setNotifs(res.items ?? [])
  }, [token])

  React.useEffect(() => {
    if (!token) return
    loadNotifs()
    const t = setInterval(loadNotifs, 2500)
    return () => clearInterval(t)
  }, [token, loadNotifs])

  const markAll = async () => {
    if (!token) return
    await api.notifMarkSeen({ all: true }, token)
    await loadNotifs()
  }

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: 'black', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap: 1, minWidth: 160 }}>
            <Select size="small" value={brand} onChange={(e) => setBrand(e.target.value)}
              sx={{ fontWeight: 700, '& fieldset': { borderColor: 'rgba(0,0,0,0.15)' } }}>
              <MenuItem value="WITCHY">WITCHY</MenuItem>
              <MenuItem value="WITCHY_EAT">WITCHY EAT</MenuItem>
              <MenuItem value="WITCHY_SHOP">WITCHY SHOP</MenuItem>
              <MenuItem value="WITCHY_TOGETHER">WITCHY TOGETHER</MenuItem>
            </Select>
          </Box>

          <Box sx={{ flex: 1, display:'flex', alignItems:'center', gap: 1, border:'1px solid rgba(0,0,0,0.12)', borderRadius: 999, px: 2, py: 0.6 }}>
            <SearchIcon sx={{ opacity: 0.7 }} />
            <InputBase placeholder="חיפוש…" onFocus={() => setSearchOpen(true)} sx={{ width:'100%' }} />
          </Box>

          <Box sx={{ display:'flex', alignItems:'center', gap: 0.5 }}>
            <IconButton onClick={() => setNotifOpen(true)}>
              <Badge badgeContent={unseen} color="default">
                <NotificationsNoneOutlinedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => setWalletOpen(true)}><WalletOutlinedIcon /></IconButton>
            <IconButton onClick={() => setCartOpen(true)}>
              <Badge badgeContent={items.length} color="default">
                <ShoppingCartOutlinedIcon />
              </Badge>
            </IconButton>
            <IconButton onClick={() => nav('/auth/jwt/login')}><AccountCircleOutlinedIcon /></IconButton>
          </Box>
        </Toolbar>

        <Toolbar variant="dense" sx={{ bgcolor:'white', color:'black', pt: 0, gap: 2 }}>
          <Typography sx={{ fontWeight: 800 }} component={RLink} to="/home" color="inherit" style={{ textDecoration:'none' }}>דף הבית</Typography>
          <Typography component={RLink} to="/search" color="inherit" style={{ textDecoration:'none' }}>חיפוש מתקדם</Typography>
          <Box sx={{ flex: 1 }} />
          <Button size="small" onClick={() => seedDemo()} sx={{ opacity: 0.7 }}>Seed Demo</Button>
          {role !== 'guest' && <Button size="small" onClick={() => logout()} sx={{ opacity: 0.7 }}>התנתקות</Button>}
          {(role === 'admin' || role === 'owner') && <Button size="small" variant="outlined" onClick={() => nav('/businesses')}>ניהול</Button>}
        </Toolbar>
      </AppBar>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <Drawer anchor="left" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 380, p: 2 }}>
          <Header title="העגלה שלי" onClose={() => setCartOpen(false)} />
          <Divider sx={{ my: 1 }} />
          {items.length === 0 ? (
            <Typography sx={{ color:'text.secondary' }}>העגלה ריקה.</Typography>
          ) : (
            <List>
              {items.map(it => (
                <ListItem key={it.product_id} secondaryAction={<Button size="small" onClick={() => remove(it.product_id)}>הסר</Button>}>
                  <ListItemText
                    primary={`${it.name} × ${it.qty}`}
                    secondary={`₪ ${(it.price_cents * it.qty) / 100}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Divider sx={{ my: 1 }} />
          <Typography sx={{ fontWeight: 800 }}>סה״כ: ₪ {totalCents / 100}</Typography>
          <Box sx={{ display:'flex', gap: 1, mt: 2 }}>
            <Button fullWidth variant="contained" disabled={!items.length} onClick={() => { setCartOpen(false); nav('/checkout/active') }}>לצ׳קאאוט</Button>
            <Button variant="outlined" disabled={!items.length} onClick={clear}>נקה</Button>
          </Box>
        </Box>
      </Drawer>

      <SimpleDrawer title="הארנק" open={walletOpen} onClose={() => setWalletOpen(false)}>
        <Typography sx={{ color:'text.secondary' }}>Placeholder לארנק/תקציבים/טרנזקציות (נמשיך מכאן).</Typography>
      </SimpleDrawer>

      <Drawer anchor="left" open={notifOpen} onClose={() => setNotifOpen(false)}>
        <Box sx={{ width: 420, p: 2 }}>
          <Header title="התראות" onClose={() => setNotifOpen(false)} right={<Button size="small" onClick={markAll}>Mark all</Button>} />
          <Divider sx={{ my: 1 }} />
          {!token ? (
            <Typography sx={{ color:'text.secondary' }}>התחבר כדי לקבל התראות.</Typography>
          ) : notifs.length === 0 ? (
            <Typography sx={{ color:'text.secondary' }}>אין התראות.</Typography>
          ) : (
            <List>
              {notifs.map(n => (
                <ListItem key={n.id}>
                  <ListItemText
                    primary={<span style={{ fontWeight: n.seen ? 500 : 900 }}>{n.title}</span>}
                    secondary={n.body}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Drawer>
    </>
  )
}

function Header({ title, onClose, right }: { title: string; onClose: () => void; right?: React.ReactNode }) {
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap: 1 }}>
      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Box sx={{ display:'flex', gap: 1, alignItems:'center' }}>
        {right}
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </Box>
    </Box>
  )
}

function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <Box component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          sx={{ position:'fixed', inset:0, bgcolor:'rgba(255,255,255,0.92)', backdropFilter:'blur(4px)', zIndex: 1300, display:'flex', justifyContent:'center', pt: 10 }}
          onClick={onClose}
        >
          <Box component={motion.div} initial={{ y:-10, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:-10, opacity:0 }}
            onClick={(e) => e.stopPropagation()}
            sx={{ width:'min(900px, 92vw)', bgcolor:'#fff', border:'1px solid rgba(0,0,0,0.12)', borderRadius: 3, p: 2 }}
          >
            <Header title="חיפוש" onClose={onClose} />
            <Divider sx={{ my: 1 }} />
            <Typography sx={{ color:'text.secondary' }}>כאן יהיו פילטרים + תוצאות כמו בישן.</Typography>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  )
}

function SimpleDrawer({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Drawer anchor="left" open={open} onClose={onClose}>
      <Box sx={{ width: 380, p: 2 }}>
        <Header title={title} onClose={onClose} />
        <Divider sx={{ my: 1 }} />
        {children}
      </Box>
    </Drawer>
  )
}
