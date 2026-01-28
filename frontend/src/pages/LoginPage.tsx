
import * as React from 'react'
import { Paper, Typography, Box, TextField, Button, Alert } from '@mui/material'
import { useAuth } from '../lib/auth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { login, seedDemo, auth } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = React.useState('admin@demo.local')
  const [password, setPassword] = React.useState('admin')
  const [err, setErr] = React.useState<string | null>(null)

  const onLogin = async () => {
    setErr(null)
    try {
      await login(email, password)
      nav('/home')
    } catch (e: any) {
      setErr(e?.message ?? 'Login failed')
    }
  }

  return (
    <Box sx={{ minHeight:'100vh', display:'grid', placeItems:'center', bgcolor:'#fff' }}>
      <Paper sx={{ p: 3, width:'min(520px, 92vw)' }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>Login</Typography>
        <Typography sx={{ color:'text.secondary', mb: 2 }}>דמו: admin / owner / customer</Typography>
        {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
        {auth && <Alert severity="success" sx={{ mb: 2 }}>Logged in as {auth.user.email} ({auth.user.role})</Alert>}
        <Box sx={{ display:'grid', gap: 1.5 }}>
          <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button variant="contained" onClick={onLogin}>Login</Button>
          <Button variant="outlined" onClick={() => seedDemo()}>Seed Demo</Button>
          <Typography sx={{ color:'text.secondary', fontSize: 13 }}>
            Users after seed: admin@demo.local/admin, owner@demo.local/owner, cust@demo.local/cust
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}
