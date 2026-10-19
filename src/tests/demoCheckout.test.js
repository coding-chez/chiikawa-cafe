import { test } from 'node:test'
import assert from 'node:assert/strict'
import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Product from '../models/Product.js'
import { products } from '../data/products.js'
import { CART_STORAGE_KEY, loadCart } from '../utils/cartStorage.js'
import { ORDER_STORAGE_KEY, loadOrder } from '../utils/orderStorage.js'
import { CHECKOUT_STORAGE_KEY, createDemoCheckout, readPendingCheckout,
  restoreDemoCart, loadCompletedDemoOrder } from '../utils/demoCheckout.js'

function exampleCart() {
  const cart = new Cart()
  cart.add(new Product({ ...products[0] }), 2)
  cart.add(new Product({ ...products[6] }))
  return cart
}

function storageFor(cart = exampleCart()) {
  const data = new Map([[CART_STORAGE_KEY, JSON.stringify(cart.items.map(({ product, quantity }) => ({ productId: product.id, quantity })))]])
  return {
    failWrite: null, failRemove: false, writes: [],
    getItem: (key) => data.get(key) ?? null,
    setItem(key, value) {
      if (key === this.failWrite) throw new Error('Write denied')
      this.writes.push([key, value])
      data.set(key, value)
    },
    removeItem(key) {
      if (this.failRemove) throw new Error('Cleanup denied')
      this.writes.push([key, null])
      data.delete(key)
    },
  }
}

test('demo checkout rejects an empty cart without writing an order', async () => {
  const storage = storageFor(new Cart())
  await assert.rejects(createDemoCheckout(storage).place(new Cart()), /empty-cart/)
  assert.equal(loadOrder(storage), null)
  assert.equal(storage.writes.length, 0)
})

test('checkout persists a confirmed Order with 3 items and PHP 410 before reporting success', async () => {
  const cart = exampleCart()
  const storage = storageFor(cart)
  const order = await createDemoCheckout(storage).place(cart)
  assert.ok(order instanceof Order)
  assert.ok(order.items.every((item) => item instanceof OrderItem))
  assert.equal(order.getItemCount(), 3)
  assert.equal(order.getTotal(), 410)
  assert.equal(order.status, 'demo-confirmed')
  assert.match(order.id, /^CC-DEMO-/)
  assert.equal(loadOrder(storage).id, order.id)
  assert.equal(loadCart(storage).cart.getItemCount(), 0)
  assert.equal(readPendingCheckout(storage), null)
  assert.equal(cart.getSubtotal(), 410, 'The service never mutates previous React state')
})

test('order snapshots retain names, unit prices and quantities after products change', async () => {
  const cart = exampleCart()
  const storage = storageFor(cart)
  const order = await createDemoCheckout(storage).place(cart)
  cart.items[0].product.name = 'Changed'
  cart.items[0].product.price = 1
  cart.updateQuantity('FOOD-001', 9)
  assert.equal(order.items[0].name, 'Strawberry Cloud Cake')
  assert.equal(order.items[0].unitPrice, 145)
  assert.equal(order.items[0].quantity, 2)
  assert.equal(order.getTotal(), 410)
  assert.equal(loadOrder(storage).getTotal(), 410)
})

test('separate checkout intents receive unique IDs', async () => {
  const storage = storageFor()
  const controller = createDemoCheckout(storage)
  const first = await controller.place(exampleCart())
  const second = await controller.place(exampleCart())
  assert.notEqual(first.id, second.id)
})

test('checkout writes recovery intent, confirmation, empty cart, then removes intent', async () => {
  const storage = storageFor()
  await createDemoCheckout(storage).place(exampleCart())
  assert.deepEqual(storage.writes.map(([key]) => key), [
    CHECKOUT_STORAGE_KEY, ORDER_STORAGE_KEY, CART_STORAGE_KEY, CHECKOUT_STORAGE_KEY,
  ])
  assert.equal(storage.writes[2][1], '[]')
  assert.equal(storage.writes[3][1], null)
})

test('failed order storage preserves cart and retries the same reference', async () => {
  const cart = exampleCart()
  const storage = storageFor(cart)
  const previousOrder = Order.fromCart(exampleCart())
  storage.setItem(ORDER_STORAGE_KEY, JSON.stringify(previousOrder))
  storage.failWrite = ORDER_STORAGE_KEY
  const controller = createDemoCheckout(storage)
  await assert.rejects(controller.place(cart), /order-save-failed/)
  const pending = readPendingCheckout(storage)
  assert.equal(cart.getItemCount(), 3)
  assert.equal(loadCart(storage).cart.getSubtotal(), 410)
  assert.equal(loadOrder(storage).id, previousOrder.id)
  storage.failWrite = null
  const order = await controller.place(cart)
  assert.equal(order.id, pending.id)
})

test('failed cart-clear writes keep checkout pending and hide premature confirmation', async () => {
  const cart = exampleCart()
  const storage = storageFor(cart)
  storage.failWrite = CART_STORAGE_KEY
  await assert.rejects(createDemoCheckout(storage).place(cart), /cart-clear-failed/)
  assert.equal(cart.getSubtotal(), 410)
  assert.equal(loadCart(storage).cart.getSubtotal(), 410)
  assert.ok(loadOrder(storage) instanceof Order)
  assert.equal(loadCompletedDemoOrder(storage), null)
  const restored = restoreDemoCart(storage)
  assert.ok(restored.pendingOrder instanceof Order)
  assert.equal(restored.cart.getItemCount(), 3)
})

test('refresh and retry after cart-clear failure reuse the saved order', async () => {
  const storage = storageFor()
  storage.failWrite = CART_STORAGE_KEY
  await assert.rejects(createDemoCheckout(storage).place(exampleCart()), /cart-clear-failed/)
  const restored = restoreDemoCart(storage)
  const pendingId = restored.pendingOrder.id
  storage.failWrite = null
  const order = await createDemoCheckout(storage).place(restored.cart)
  assert.equal(order.id, pendingId)
  assert.equal(loadCart(storage).cart.getItemCount(), 0)
  assert.equal(loadCompletedDemoOrder(storage).id, pendingId)
  assert.equal(storage.writes.filter(([key]) => key === CHECKOUT_STORAGE_KEY).length, 2)
})

test('failed cleanup recovers pending selections even after the stored cart is empty', async () => {
  const storage = storageFor()
  storage.failRemove = true
  await assert.rejects(createDemoCheckout(storage).place(exampleCart()), /finish-failed/)
  assert.equal(loadCart(storage).cart.getItemCount(), 0)
  const restored = restoreDemoCart(storage)
  assert.equal(restored.cart.getItemCount(), 3)
  assert.ok(restored.pendingOrder)
  assert.equal(loadCompletedDemoOrder(storage), null)
  storage.failRemove = false
  const order = await createDemoCheckout(storage).place(restored.cart)
  assert.equal(order.id, restored.pendingOrder.id)
  assert.equal(readPendingCheckout(storage), null)
})

test('synchronous duplicate submissions create one order and cannot overwrite it', async () => {
  const storage = storageFor()
  const controller = createDemoCheckout(storage)
  const cart = exampleCart()
  const first = controller.place(cart)
  assert.equal(controller.busy, true)
  const second = controller.place(cart)
  const [order, duplicate] = await Promise.all([first, second])
  assert.equal(duplicate, null)
  assert.equal(controller.busy, false)
  assert.equal(await controller.place(cart), order)
  assert.equal(storage.writes.filter(([key]) => key === ORDER_STORAGE_KEY).length, 1)
  assert.equal(loadOrder(storage).id, order.id)
})

test('journal preparation and unavailable storage failures leave the cart intact', async () => {
  const cart = exampleCart()
  const storage = storageFor(cart)
  storage.failWrite = CHECKOUT_STORAGE_KEY
  await assert.rejects(createDemoCheckout(storage).place(cart), /prepare-failed/)
  await assert.rejects(createDemoCheckout(null).place(cart), /storage-failed/)
  assert.equal(loadOrder(storage), null)
  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 410)
})

test('success refresh reconstructs the same Order and OrderItem methods', async () => {
  const storage = storageFor()
  const order = await createDemoCheckout(storage).place(exampleCart())
  const restored = loadCompletedDemoOrder(storage)
  assert.notEqual(restored, order)
  assert.ok(restored instanceof Order)
  assert.ok(restored.items[0] instanceof OrderItem)
  assert.equal(restored.id, order.id)
  assert.equal(restored.items[0].getLineTotal(), 290)
  assert.equal(restored.getItemCount(), 3)
  assert.equal(restored.getTotal(), 410)
})

test('missing and malformed receipts or journal data fall back safely', async () => {
  const storage = storageFor()
  assert.equal(loadCompletedDemoOrder(storage), null)
  for (const json of ['{', 'null', '{}', '[]']) {
    storage.setItem(ORDER_STORAGE_KEY, json)
    assert.equal(loadCompletedDemoOrder(storage), null)
  }
  storage.setItem(CHECKOUT_STORAGE_KEY, '{')
  const restored = restoreDemoCart(storage)
  assert.equal(restored.recoveryError, 'recovery-failed')
  assert.equal(restored.cart.getItemCount(), 3)
  assert.equal(loadCompletedDemoOrder(storage), null)
  await assert.rejects(createDemoCheckout(storage).place(restored.cart), /recovery-failed/)
})

test('a changed cart cannot overwrite a pending confirmation', async () => {
  const storage = storageFor()
  storage.failWrite = CART_STORAGE_KEY
  await assert.rejects(createDemoCheckout(storage).place(exampleCart()), /cart-clear-failed/)
  const reference = readPendingCheckout(storage).id
  const other = new Cart()
  other.add(products[3])
  storage.failWrite = null
  await assert.rejects(createDemoCheckout(storage).place(other), /cart-changed/)
  assert.equal(readPendingCheckout(storage).id, reference)
  assert.equal(loadOrder(storage).id, reference)
})

test('post-checkout empty cart can accept new items and create a new demo order', async () => {
  const storage = storageFor()
  const controller = createDemoCheckout(storage)
  const first = await controller.place(exampleCart())
  const { cart } = restoreDemoCart(storage)
  assert.equal(cart.getItemCount(), 0)
  cart.add(products[3])
  const second = await controller.place(cart)
  assert.notEqual(second.id, first.id)
  assert.equal(second.getItemCount(), 1)
  assert.equal(second.getTotal(), 185)
})
