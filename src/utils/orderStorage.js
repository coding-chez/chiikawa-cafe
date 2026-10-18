import Order from '../models/Order.js'

export const ORDER_STORAGE_KEY = 'chiikawa-cafe.latest-order'

export function saveOrder(order, storage) {
  try {
    const confirmedOrder = new Order(order)
    const target = storage === undefined ? globalThis.localStorage : storage
    if (!target) throw new Error('Local storage is unavailable.')
    target.setItem(ORDER_STORAGE_KEY, JSON.stringify(confirmedOrder))
  } catch (cause) {
    throw new Error('Unable to save the demo order.', { cause })
  }
}

export function loadOrder(storage) {
  try {
    const target = storage === undefined ? globalThis.localStorage : storage
    const json = target?.getItem(ORDER_STORAGE_KEY)
    return json ? new Order(JSON.parse(json)) : null
  } catch {
    return null
  }
}

export function checkout(cart, storage) {
  const order = Order.fromCart(cart)
  saveOrder(order, storage)
  cart.clear()
  return order
}
