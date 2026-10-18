import { test } from 'node:test'
import assert from 'node:assert/strict'
import { products } from '../data/products.js'
import { categories } from '../data/categories.js'
import Product from '../models/Product.js'
import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'
import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import { filterProducts, sortProducts, getFeaturedProducts, getProductById } from '../utils/catalog.js'
import { formatCurrency } from '../utils/currency.js'
import { saveOrder, loadOrder, checkout, ORDER_STORAGE_KEY } from '../utils/orderStorage.js'

function exampleCart() {
  const cart = new Cart()
  cart.add(new Product({ ...products[0] }), 2)
  cart.add(new Product({ ...products[6] }))
  return cart
}

function memoryStorage() {
  const data = new Map()
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) }
}

test('catalog contains 12 unique available Products, three in each category', () => {
  assert.equal(products.length, 12)
  assert.equal(new Set(products.map((p) => p.id)).size, 12)
  assert.deepEqual(categories.map((c) => c.id), ['DESSERTS', 'MEALS', 'DRINKS', 'SNACKS'])
  for (const category of categories) {
    assert.equal(products.filter((p) => category.matches(p)).length, 3)
  }
  for (const product of products) {
    assert.ok(product instanceof Product)
    assert.equal(typeof product.price, 'number')
    assert.equal(product.available, true)
    assert.deepEqual(product.ingredients, [])
    assert.equal(product.image, '')
  }
})

test('search handles partial names, mixed case, whitespace and descriptions', () => {
  for (const query of ['cloud', 'ClOuD', '  cloud  ', 'sponge']) {
    assert.deepEqual(filterProducts(products, { query }).map((p) => p.id), ['FOOD-001'])
  }
  assert.equal(filterProducts(products, { query: '   ' }).length, 12)
  assert.equal(filterProducts(products, { query: 'unknown' }).length, 0)
})

test('All, category and combined search filters', () => {
  assert.equal(filterProducts(products).length, 12)
  assert.equal(filterProducts(products, { categoryId: 'All' }).length, 12)
  assert.equal(filterProducts(products, { categoryId: 'DRINKS' }).length, 3)
  assert.deepEqual(filterProducts(products, { query: 'strawberry', categoryId: 'DRINKS' }).map((p) => p.id), ['FOOD-008'])
  assert.equal(filterProducts(products, { categoryId: 'UNKNOWN' }).length, 0)
})

test('sorting preserves input order and composes with filtering', () => {
  const original = [...products]
  assert.deepEqual(sortProducts(products), products)
  assert.notEqual(sortProducts(products), products)
  for (const [sortBy, compare] of [
    ['price-low', (a, b) => a.price - b.price],
    ['price-high', (a, b) => b.price - a.price],
    ['name-asc', (a, b) => a.name.localeCompare(b.name)],
  ]) {
    const result = sortProducts(products, sortBy)
    assert.ok(result.every((p, i) => i === 0 || compare(result[i - 1], p) <= 0))
  }
  assert.deepEqual(products, original)
  assert.deepEqual(sortProducts(filterProducts(products, { categoryId: 'DRINKS' }), 'price-low').map((p) => p.price), [110, 120, 135])
})

test('featured IDs and product lookup', () => {
  assert.deepEqual(getFeaturedProducts(products).map((p) => p.id), ['FOOD-001', 'FOOD-004', 'FOOD-007'])
  assert.equal(getProductById(products, 'FOOD-004'), products[3])
  assert.equal(getProductById(products, 'missing'), undefined)
})

test('cart merges duplicate products and counts quantities', () => {
  const cart = new Cart()
  cart.add(products[0])
  cart.add(products[0], 2)
  assert.equal(cart.items.length, 1)
  assert.ok(cart.items[0] instanceof CartItem)
  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 435)
})

test('cart updates, removes and clears', () => {
  const cart = exampleCart()
  cart.updateQuantity('FOOD-001', 3)
  assert.equal(cart.getSubtotal(), 555)
  cart.remove('FOOD-001')
  assert.equal(cart.getItemCount(), 1)
  cart.remove('missing')
  assert.throws(() => cart.updateQuantity('missing', 1))
  cart.clear()
  assert.equal(cart.getItemCount(), 0)
  assert.equal(cart.getSubtotal(), 0)
})

test('invalid quantities and unavailable products are rejected without mutation', () => {
  const cart = exampleCart()
  for (const quantity of [0, -1, 1.5, NaN, Infinity, '2', null, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => cart.add(products[0], quantity))
    assert.throws(() => cart.updateQuantity('FOOD-001', quantity))
    assert.throws(() => new CartItem(products[0], quantity))
  }
  assert.throws(() => cart.add(new Product({ ...products[0], available: false })))
  assert.equal(cart.getSubtotal(), 410)
})

test('example cart and order have quantity 3 and PHP 410', () => {
  const cart = exampleCart()
  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 410)
  const order = Order.fromCart(cart)
  assert.equal(order.getItemCount(), 3)
  assert.equal(order.getTotal(), 410)
  assert.equal(order.status, 'demo-confirmed')
  assert.equal(new Date(order.createdAt).toISOString(), order.createdAt)
  assert.match(formatCurrency(order.getTotal()), /410/)
  assert.match(formatCurrency(order.getTotal()), /₱|PHP/)
})

test('empty carts cannot create orders', () => {
  assert.throws(() => Order.fromCart(new Cart()))
})

test('order items snapshot prices, names, quantities and IDs', () => {
  const cart = exampleCart()
  const order = Order.fromCart(cart)
  cart.items[0].product.price = 999
  cart.items[0].product.name = 'Changed'
  cart.updateQuantity('FOOD-001', 10)
  assert.ok(order.items[0] instanceof OrderItem)
  assert.equal(order.items[0].name, 'Strawberry Cloud Cake')
  assert.equal(order.getTotal(), 410)
  assert.equal(order.getItemCount(), 3)
  const restored = new Order(JSON.parse(JSON.stringify(order)))
  assert.equal(restored.items[0].getLineTotal(), 290)
  order.items[0].unitPrice = 1
  assert.equal(restored.getTotal(), 410)
})

test('order IDs are distinct and have the demo prefix', () => {
  const ids = Array.from({ length: 100 }, () => Order.fromCart(exampleCart()).id)
  assert.equal(new Set(ids).size, 100)
  assert.ok(ids.every((id) => id.startsWith('CC-DEMO-')))
})

test('save and restore latest order with class methods intact', () => {
  const storage = memoryStorage()
  const first = Order.fromCart(exampleCart())
  saveOrder(first, storage)
  const order = Order.fromCart(exampleCart())
  saveOrder(order, storage)
  const restored = loadOrder(storage)
  assert.ok(restored instanceof Order)
  assert.ok(restored.items[0] instanceof OrderItem)
  assert.equal(restored.id, order.id)
  assert.equal(restored.getTotal(), 410)
  assert.equal(restored.items[0].getLineTotal(), 290)
})

test('missing, inaccessible, malformed and invalid storage is guarded', () => {
  const storage = memoryStorage()
  assert.equal(loadOrder(storage), null)
  for (const value of ['{', 'null', '{}', '{"items":[]}', JSON.stringify({ ...Order.fromCart(exampleCart()), items: [{ productId: 'a', name: 'b', unitPrice: -1, quantity: 1 }] })]) {
    storage.setItem(ORDER_STORAGE_KEY, value)
    assert.equal(loadOrder(storage), null)
  }
  assert.equal(loadOrder(null), null)
  assert.equal(loadOrder({ getItem() { throw new Error('Denied') } }), null)
  assert.throws(() => saveOrder(Order.fromCart(exampleCart()), null), /Unable to save/)
})

test('checkout persists before clearing and preserves cart on write failure', () => {
  const cart = exampleCart()
  const storage = memoryStorage()
  const order = checkout(cart, storage)
  assert.equal(loadOrder(storage).id, order.id)
  assert.equal(cart.getItemCount(), 0)
  for (const target of [null, { setItem() { throw new Error('Quota exceeded') } }]) {
    const failedCart = exampleCart()
    assert.throws(() => checkout(failedCart, target), /Unable to save/)
    assert.equal(failedCart.getItemCount(), 3)
    assert.equal(failedCart.getSubtotal(), 410)
  }
})
