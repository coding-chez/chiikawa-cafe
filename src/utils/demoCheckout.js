import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import { loadOrder, saveOrder } from './orderStorage.js'
import { loadCart, saveCart } from './cartStorage.js'

export const CHECKOUT_STORAGE_KEY = 'chiikawa-cafe-checkout-v1'

function getStorage(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage
    if (!target) throw new Error()
    return target
  } catch {
    throw new Error('storage-failed')
  }
}

export function readPendingCheckout(storage) {
  const target = getStorage(storage)
  let json
  try {
    json = target.getItem(CHECKOUT_STORAGE_KEY)
  } catch {
    throw new Error('storage-failed')
  }
  if (json === null) return null
  try {
    return new Order(JSON.parse(json))
  } catch {
    throw new Error('recovery-failed')
  }
}

export function restoreDemoCart(storage) {
  try {
    const pendingOrder = readPendingCheckout(storage)
    if (pendingOrder) {
      // Recover selections even if the previous attempt already saved an empty cart.
      const entries = pendingOrder.items.map(({ productId, quantity }) => ({ productId, quantity }))
      const restored = loadCart({ getItem: () => JSON.stringify(entries) })
      return { ...restored, pendingOrder, recoveryError: null }
    }
  } catch (error) {
    return {
      ...loadCart(storage), pendingOrder: null,
      recoveryError: error.message === 'recovery-failed' ? error.message : null,
    }
  }
  return { ...loadCart(storage), pendingOrder: null, recoveryError: null }
}

function selections(items, orderItems = false) {
  return items.map((item) => [orderItems ? item.productId : item.product.id, item.quantity])
    .sort(([a], [b]) => a.localeCompare(b))
}

// One controller per provider. The synchronous guard works before React rerenders.
export function createDemoCheckout(storage) {
  let inFlight = false
  let completedCart = null
  let completedOrder = null

  return {
    get busy() { return inFlight },
    async place(cart) {
      if (inFlight) return null
      // A second event with the same pre-render Cart cannot create another order.
      if (cart === completedCart) return completedOrder
      inFlight = true
      try {
        await Promise.resolve()
        const target = getStorage(storage)
        const pendingOrder = readPendingCheckout(target)
        if (!pendingOrder && cart.items.length === 0) throw new Error('empty-cart')
        if (pendingOrder && JSON.stringify(selections(cart.items)) !== JSON.stringify(selections(pendingOrder.items, true))) {
          throw new Error('cart-changed')
        }
        const order = pendingOrder || Order.fromCart(cart)
        if (!pendingOrder) {
          try {
            target.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(order))
          } catch {
            throw new Error('prepare-failed')
          }
        }
        try {
          saveOrder(order, target)
        } catch {
          throw new Error('order-save-failed')
        }
        if (saveCart(new Cart(), target).warning) throw new Error('cart-clear-failed')
        try {
          target.removeItem(CHECKOUT_STORAGE_KEY)
        } catch {
          throw new Error('finish-failed')
        }
        completedCart = cart
        completedOrder = order
        return order
      } finally {
        inFlight = false
      }
    },
  }
}

// A saved confirmation is displayed only after the cart-clear transition finished.
export function loadCompletedDemoOrder(storage) {
  try {
    if (readPendingCheckout(storage)) return null
    return loadOrder(storage)
  } catch {
    return null
  }
}
