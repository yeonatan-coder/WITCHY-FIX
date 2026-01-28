
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, loadAuth, saveAuth } from './api'

type AuthState = { token: string; user: any } | null
const Ctx = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>(() => loadAuth())
  useEffect(() => { saveAuth(auth) }, [auth])

  const login = async (email: string, password: string) => setAuth(await api.login(email, password))
  const logout = () => setAuth(null)
  const seedDemo = async () => { await api.seedDemo() }

  const value = useMemo(() => ({ auth, login, logout, seedDemo }), [auth])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
export function useAuth() { const v = useContext(Ctx); if (!v) throw new Error('useAuth'); return v }
