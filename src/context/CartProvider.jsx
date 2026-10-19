import { useCallback, useEffect, useMemo, useState } from 'react'
import { CartContext } from './CartContext.js'
import { changeCart } from '../utils/cartState.js'
import { loadCart, saveCart } from '../utils/cartStorage.js'
import { cartContent } from '../data/cartContent.js'

export default function CartProvider({ children }) {
  // Restore synchronously before any persistence effect can write an empty cart.
  const [state, setState] = useState(() => ({
    ...loadCart(), feedback: '', feedbackId: 0,
  }))
  const [writeWarning, setWriteWarning] = useState(null)

  useEffect(() => {
    let active = true
    async function persist() {
      const result = await saveCart(state.cart)
      if (active) setWriteWarning(result.warning)
    }
    persist()
    return () => { active = false }
  }, [state.cart])

  useEffect(() => {
    if (!state.feedback) return
    const timer = setTimeout(() => {
      setState((previous) => ({ ...previous, feedback: '' }))
    }, 5000)
    return () => clearTimeout(timer)
  }, [state.feedback, state.feedbackId])

  const updateCart = useCallback((change, feedback) => {
    setState((previous) => {
      try {
        return {
          ...previous,
          cart: changeCart(previous.cart, change),
          feedback,
          feedbackId: previous.feedbackId + 1,
        }
      } catch {
        // Validation failures preserve the previous Cart and report useful feedback.
        return {
          ...previous,
          feedback: cartContent.updateFailed,
          feedbackId: previous.feedbackId + 1,
        }
      }
    })
  }, [])

  const addToCart = useCallback((product, quantity = 1) => {
    updateCart((cart) => cart.add(product, quantity), cartContent.added(product.name, quantity))
  }, [updateCart])
  const updateQuantity = useCallback((productId, quantity) => {
    updateCart((cart) => cart.updateQuantity(productId, quantity), cartContent.updated)
  }, [updateCart])
  const removeFromCart = useCallback((productId) => {
    updateCart((cart) => cart.remove(productId), cartContent.removed)
  }, [updateCart])
  const clearCart = useCallback(() => {
    updateCart((cart) => cart.clear(), cartContent.cleared)
  }, [updateCart])

  const value = useMemo(() => ({
    cart: state.cart,
    addToCart, updateQuantity, removeFromCart, clearCart,
    itemCount: state.cart.getItemCount(),
    subtotal: state.cart.getSubtotal(),
    feedback: state.feedback,
    persistenceWarning: cartContent.storageWarnings[writeWarning || state.warning] ?? '',
  }), [state, writeWarning, addToCart, updateQuantity, removeFromCart, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
