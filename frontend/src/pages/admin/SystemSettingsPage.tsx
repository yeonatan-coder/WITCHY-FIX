
import * as React from 'react'
import { Paper, Typography, Box, Switch, FormControlLabel, Alert, Button } from '@mui/material'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

export default function SystemSettingsPage() {
  const { auth } = useAuth()
  const token = auth?.token
  const [auto, setAuto] = React.useState(false)
  const [err, setErr] = React.useState<string | null>(null)
  const [ok, setOk] = React.useState<string | null>(null)

  const load = async () => {
    setErr(null); setOk(null)
    try {
      const s = await api.settingsGet(token)
      setAuto(!!s.order_auto_approve)
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }
  React.useEffect(() => { load() }, [])

  const save = async () => {
    setErr(null); setOk(null)
    try {
      await api.settingsPut({ order_auto_approve: auto }, token)
      setOk('Saved')
    } catch (e: any) {
      setErr(e?.message ?? 'Failed')
    }
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display:'flex', justifyContent:'space-between', gap: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>System Settings</Typography>
        <Button variant="outlined" onClick={load}>Reload</Button>
      </Box>
      {err && <Alert severity="error" sx={{ mt: 2 }}>{err}</Alert>}
      {ok && <Alert severity="success" sx={{ mt: 2 }}>{ok}</Alert>}
      <Box sx={{ mt: 2 }}>
        <FormControlLabel control={<Switch checked={auto} onChange={(e) => setAuto(e.target.checked)} />} label="Auto-approve orders" />
      </Box>
      <Button variant="contained" onClick={save}>Save</Button>
    </Paper>
  )
}
