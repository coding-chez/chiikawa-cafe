export function validateQuantity(quantity) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError('Quantity must be a positive safe integer.')
  }
}

export default class CartItem {
  constructor(product, quantity = 1) {
    this.product = product
    this.setQuantity(quantity)
  }

  getLineTotal() {
    return this.product.price * this.quantity
  }

  setQuantity(quantity) {
    validateQuantity(quantity)
    this.quantity = quantity
  }
}
