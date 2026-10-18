import OrderItem from './OrderItem.js'

let sequence = 0

function createId() {
  if (globalThis.crypto?.randomUUID) return 'CC-DEMO-' + globalThis.crypto.randomUUID()
  sequence += 1
  return 'CC-DEMO-' + Date.now().toString(36) + '-' + sequence.toString(36) +
    '-' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

export default class Order {
  constructor({ id, createdAt, items, status }) {
    if (typeof id !== 'string' || !id.startsWith('CC-DEMO-') || id.length <= 8 ||
        typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt)) ||
        new Date(createdAt).toISOString() !== createdAt ||
        status !== 'demo-confirmed' || !Array.isArray(items) || items.length === 0) {
      throw new TypeError('Invalid confirmed order.')
    }
    this.id = id
    this.createdAt = createdAt
    this.items = items.map((item) => new OrderItem(item))
    this.status = status
  }

  static fromCart(cart) {
    if (cart.items.length === 0) throw new Error('Cannot order an empty cart.')
    return new Order({
      id: createId(),
      createdAt: new Date().toISOString(),
      status: 'demo-confirmed',
      items: cart.items.map(({ product, quantity }) => ({
        productId: product.id, name: product.name, unitPrice: product.price, quantity,
      })),
    })
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  getTotal() {
    return this.items.reduce((total, item) => total + item.getLineTotal(), 0)
  }
}
