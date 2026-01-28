
import React, { createContext, useContext, useMemo, useState } from 'react'

export type CartItem = { product_id: string; name: string; price_cents: number; qty: number; store_id: string }
type Ctx = {
  items: CartItem[]
  add: (it: Omit<CartItem,'qty'>, qty?: number) => void
  remove: (product_id: string) => void
  clear: () => void
  totalCents: number
  storeId: string | null
}
const CartCtx = createContext<Ctx | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const add = (it: Omit<CartItem,'qty'>, qty = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.product_id === it.product_id)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + qty }
        return copy
      }
      return [...prev, { ...it, qty }]
    })
  }
  const remove = (product_id: string) => setItems(prev => prev.filter(p => p.product_id !== product_id))
  const clear = () => setItems([])

  const totalCents = items.reduce((s, it) => s + (it.price_cents * it.qty), 0)
  const storeId = items.length ? items[0].store_id : null

  const value = useMemo(() => ({ items, add, remove, clear, totalCents, storeId }), [items, totalCents, storeId])
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}
export function useCart() { const v = useContext(CartCtx); if (!v) throw new Error('useCart'); return v }
