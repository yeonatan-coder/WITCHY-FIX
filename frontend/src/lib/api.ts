
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://127.0.0.1:8000'

async function http<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers || {})
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return (await res.json()) as T
}

export const api = {
  seedDemo: () => http<any>(`/api/v2/seed/demo`, { method:'POST' }),
  settingsGet: (token?: string) => http<any>(`/api/v2/system/settings`, {}, token),
  settingsPut: (payload: any, token?: string) => http<any>(`/api/v2/system/settings`, { method:'PUT', body: JSON.stringify(payload) }, token),

  login: (email: string, password: string) => http<any>(`/api/v2/auth/login`, { method:'POST', body: JSON.stringify({ email, password }) }),

  find: (resource: string, where: any, token?: string) => http<any>(`/api/v2/${resource}/find/`, { method:'POST', body: JSON.stringify({ where }) }, token),
  getById: (resource: string, id: string, token?: string) => http<any>(`/api/v2/${resource}/${id}/`, {}, token),
  create: (resource: string, payload: any, token?: string) => http<any>(`/api/v2/${resource}/`, { method:'POST', body: JSON.stringify(payload) }, token),

  storeWizard: (payload: any, token?: string) => http<any>(`/api/v2/store-wizard`, { method:'POST', body: JSON.stringify(payload) }, token),
  ordersCreate: (payload: any, token?: string) => http<any>(`/api/v2/orders/create`, { method:'POST', body: JSON.stringify(payload) }, token),

  notifFind: (where: any, token?: string) => http<any>(`/api/v2/notification/find/`, { method:'POST', body: JSON.stringify({ where }) }, token),
  notifMarkSeen: (payload: any, token?: string) => http<any>(`/api/v2/notification/mark_seen`, { method:'POST', body: JSON.stringify(payload) }, token),

  orderApprove: (id: string, token?: string) => http<any>(`/api/v2/order/${id}/approve`, { method:'POST' }, token),
  orderReject: (id: string, token?: string) => http<any>(`/api/v2/order/${id}/reject`, { method:'POST' }, token),
}

export function loadAuth() { try { const r = localStorage.getItem('witchy_auth'); return r ? JSON.parse(r) : null } catch { return null } }
export function saveAuth(v: any) { localStorage.setItem('witchy_auth', JSON.stringify(v ?? null)) }
