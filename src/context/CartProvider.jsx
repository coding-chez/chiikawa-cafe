import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { CartContext } from './CartContext.js'
import Cart from '../models/Cart.js'
import { changeCart } from '../utils/cartState.js'
import { saveCart } from '../utils/cartStorage.js'
import { createDemoCheckout, readPendingCheckout, restoreDemoCart } from '../utils/demoCheckout.js'
import { cartContent } from '../data/cartContent.js'
import { checkoutContent } from '../data/checkoutContent.js'

export default function CartProvider({ children }) {
  const [state, setState] = useState(() => ({
    ...restoreDemoCart(), feedback: '', feedbackId: 0,
  }))
  const [controller] = useState(() => createDemoCheckout())
  const persistedCart = useRef(null)
  const [writeWarning, setWriteWarning] = useState(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    // Never write recovered checkout items over a cart that was already cleared.
    if (isCheckingOut || state.pendingOrder || state.recoveryError || persistedCart.current === state.cart) return
    let active = true
    async function persist() {
      const result = await saveCart(state.cart)
      if (active) setWriteWarning(result.warning)
    }
    persist()
    return () => { active = false }
  }, [state.cart, state.pendingOrder, state.recoveryError, isCheckingOut])

  useEffect(() => {
    if (!state.feedback) return
    const timer = setTimeout(() => {
      setState((previous) => ({ ...previous, feedback: '' }))
    }, 5000)
    return () => clearTimeout(timer)
  }, [state.feedback, state.feedbackId])

  const updateCart = useCallback((change, feedback) => {
    if (controller.busy) return
    setState((previous) => {
      if (previous.pendingOrder || previous.recoveryError) {
        return { ...previous, feedback: checkoutContent.locked, feedbackId: previous.feedbackId + 1 }
      }
      try {
        const next = changeCart(previous.cart, change)
        return {
          ...previous, cart: next,
          feedback: feedback + ' ' + cartContent.countStatus(next.getItemCount()),
          feedbackId: previous.feedbackId + 1,
        }
      } catch {
        return {
          ...previous, feedback: cartContent.updateFailed,
          feedbackId: previous.feedbackId + 1,
        }
      }
    })
    setCheckoutError('')
  }, [controller])

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

  const placeDemoOrder = useCallback(async () => {
    if (controller.busy) return null
    setIsCheckingOut(true)
    setCheckoutError('')
    try {
      const order = await controller.place(state.cart)
      if (!order) return null
      const emptyCart = new Cart()
      // Storage was already cleared by the transaction; do not write it twice.
      persistedCart.current = emptyCart
      setWriteWarning(null)
      setState((previous) => ({
        ...previous, cart: emptyCart, pendingOrder: null, recoveryError: null,
        warning: null, feedback: '', feedbackId: previous.feedbackId + 1,
      }))
      return order
    } catch (error) {
      let pendingOrder = state.pendingOrder
      try { pendingOrder = readPendingCheckout() } catch { /* Keep known recovery data. */ }
      setState((previous) => ({ ...previous, pendingOrder }))
      setCheckoutError(checkoutContent.errors[error.message] || checkoutContent.errors.fallback)
      return null
    } finally {
      setIsCheckingOut(false)
    }
  }, [controller, state.cart, state.pendingOrder])

  const value = useMemo(() => ({
    cart: state.cart,
    addToCart, updateQuantity, removeFromCart, clearCart, placeDemoOrder,
    itemCount: state.cart.getItemCount(),
    subtotal: state.cart.getSubtotal(),
    feedback: state.feedback,
    persistenceWarning: cartContent.storageWarnings[writeWarning || state.warning] ?? '',
    isCheckingOut,
    checkoutPending: Boolean(state.pendingOrder || state.recoveryError),
    pendingOrder: state.pendingOrder,
    checkoutError: checkoutError || checkoutContent.errors[state.recoveryError] || '',
  }), [state, writeWarning, addToCart, updateQuantity, removeFromCart, clearCart,
    placeDemoOrder, isCheckingOut, checkoutError])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
