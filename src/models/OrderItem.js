import { validateQuantity } from './CartItem.js'

export default class OrderItem {
  constructor({ productId, name, unitPrice, quantity }) {
    validateQuantity(quantity)
    if (typeof productId !== 'string' || !productId.trim() ||
        typeof name !== 'string' || !name.trim() ||
        !Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new TypeError('Invalid order item.')
    }
    Object.assign(this, { productId, name, unitPrice, quantity })
  }

  getLineTotal() {
    return this.unitPrice * this.quantity
  }
}
