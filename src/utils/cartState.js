import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'

// Clone mutable rows, while retaining the canonical Product references.
export function changeCart(cart, change) {
  const next = new Cart()
  next.items = cart.items.map((item) => new CartItem(item.product, item.quantity))
  change(next)
  return next
}
