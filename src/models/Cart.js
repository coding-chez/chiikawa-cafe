import CartItem, { validateQuantity } from './CartItem.js'

export default class Cart {
  constructor() {
    this.items = []
  }

  add(product, quantity = 1) {
    validateQuantity(quantity)
    if (!product.available) throw new Error('Product is unavailable.')
    const item = this.items.find((item) => item.product.id === product.id)
    if (item) item.setQuantity(item.quantity + quantity)
    else this.items.push(new CartItem(product, quantity))
  }

  updateQuantity(productId, quantity) {
    validateQuantity(quantity)
    const item = this.items.find((item) => item.product.id === productId)
    if (!item) throw new Error('Product is not in the cart.')
    item.setQuantity(quantity)
  }

  remove(productId) {
    this.items = this.items.filter((item) => item.product.id !== productId)
  }

  getItemCount() {
    return this.items.reduce((count, item) => count + item.quantity, 0)
  }

  getSubtotal() {
    return this.items.reduce((total, item) => total + item.getLineTotal(), 0)
  }

  clear() {
    this.items = []
  }
}
