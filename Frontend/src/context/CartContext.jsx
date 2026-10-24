import { createContext, useContext, useEffect, useMemo, useState } from 'react'
const CartContext = createContext(null)
export function CartProvider({ children }) {
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('incense_cart') || '[]') } catch { return [] } })
  useEffect(() => localStorage.setItem('incense_cart', JSON.stringify(items)), [items])
  const addItem = (product, quantity = 1) => setItems((current) => {
    const id = product._id || product.id
    const found = current.find((item) => (item._id || item.id) === id)
    return found ? current.map((item) => (item._id || item.id) === id ? { ...item, quantity: Math.min((item.quantity || 1) + quantity, item.stock || 99) } : item) : [...current, { ...product, quantity }]
  })
  const changeQuantity = (id, quantity) => setItems((current) => current.map((item) => (item._id || item.id) === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock || 99)) } : item))
  const removeItem = (id) => setItems((current) => current.filter((item) => (item._id || item.id) !== id))
  const clearCart = () => setItems([])
  const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const total = items.reduce((sum, item) => sum + Number(item.actualPrice || item.price || 0) * (item.quantity || 1), 0)
  const value = useMemo(() => ({ items, count, total, addItem, changeQuantity, removeItem, clearCart }), [items, count, total])
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
export const useCart = () => useContext(CartContext)
