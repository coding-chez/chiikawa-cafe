import Cart from '../models/Cart.js'
import { validateQuantity } from '../models/CartItem.js'
import { products } from '../data/products.js'
import { getProductById } from './catalog.js'

export const CART_STORAGE_KEY = 'chiikawa-cafe-cart-v1'

export function loadCart(storage, catalog = products) {
  const cart = new Cart()
  let json
  try {
    const target = storage === undefined ? globalThis.localStorage : storage
    if (!target) return { cart, warning: 'read-failed' }
    json = target.getItem(CART_STORAGE_KEY)
  } catch {
    return { cart, warning: 'read-failed' }
  }
  if (json === null) return { cart, warning: null }

  let entries
  try {
    entries = JSON.parse(json)
  } catch {
    return { cart, warning: 'invalid-data' }
  }
  if (!Array.isArray(entries)) return { cart, warning: 'invalid-data' }

  let skipped = false
  for (const entry of entries) {
    try {
      if (!entry || typeof entry.productId !== 'string') throw new TypeError('Invalid saved item.')
      const product = getProductById(catalog, entry.productId)
      if (!product) throw new Error('Unknown saved product.')
      validateQuantity(entry.quantity)
      cart.add(product, entry.quantity)
    } catch {
      skipped = true
    }
  }
  return { cart, warning: skipped ? 'partial-data' : null }
}

export function saveCart(cart, storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage
    if (!target) throw new Error('Storage unavailable.')
    const entries = cart.items.map(({ product, quantity }) => ({ productId: product.id, quantity }))
    target.setItem(CART_STORAGE_KEY, JSON.stringify(entries))
    return { warning: null }
  } catch {
    return { warning: 'write-failed' }
  }
}
