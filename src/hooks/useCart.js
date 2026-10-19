import { useContext } from 'react'
import { CartContext } from '../context/CartContext.js'

export default function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider.')
  return context
}
