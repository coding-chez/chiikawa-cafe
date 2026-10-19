import { test } from 'node:test'
import assert from 'node:assert/strict'
import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'
import Product from '../models/Product.js'
import { products } from '../data/products.js'
import { changeCart } from '../utils/cartState.js'
import { CART_STORAGE_KEY, loadCart, saveCart } from '../utils/cartStorage.js'
import { ORDER_STORAGE_KEY } from '../utils/orderStorage.js'

function memoryStorage(entries = []) {
  const values = new Map(entries)
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
}

function exampleCart() {
  const cart = new Cart()
  cart.add(products[0], 2)
  cart.add(products[6])
  return cart
}

test('cart changes clone mutable rows and preserve previous React state', () => {
  const previous = exampleCart()
  const next = changeCart(previous, (cart) => cart.updateQuantity('FOOD-001', 3))
  assert.ok(next instanceof Cart)
  assert.ok(next.items[0] instanceof CartItem)
  assert.notEqual(previous, next)
  assert.notEqual(previous.items, next.items)
  assert.notEqual(previous.items[0], next.items[0])
  assert.equal(previous.items[0].product, next.items[0].product)
  assert.equal(previous.getSubtotal(), 410)
  assert.equal(next.getSubtotal(), 555)
})

test('successive immutable additions merge duplicate products and count total units', () => {
  const empty = new Cart()
  const first = changeCart(empty, (cart) => cart.add(products[0]))
  const second = changeCart(first, (cart) => cart.add(products[0]))
  const third = changeCart(second, (cart) => cart.add(products[6]))
  assert.equal(empty.getItemCount(), 0)
  assert.equal(first.getItemCount(), 1)
  assert.equal(second.items.length, 1)
  assert.equal(third.items.length, 2)
  assert.equal(third.getItemCount(), 3)
  assert.equal(third.getSubtotal(), 410)
})

test('quantity minimum and unavailable validation preserve the previous cart', () => {
  const previous = exampleCart()
  for (const quantity of [0, -1, 1.5, undefined, '2', NaN, Infinity]) {
    assert.throws(() => changeCart(previous, (cart) => cart.updateQuantity('FOOD-001', quantity)))
  }
  assert.throws(() => changeCart(previous, (cart) => cart.add(new Product({ ...products[0], available: false }))))
  assert.equal(previous.getSubtotal(), 410)
  assert.equal(previous.getItemCount(), 3)
})

test('quantity increments/decrements, separate removal and clearing update model totals', () => {
  let cart = exampleCart()
  cart = changeCart(cart, (next) => next.updateQuantity('FOOD-001', 3))
  assert.equal(cart.getItemCount(), 4)
  assert.equal(cart.getSubtotal(), 555)
  cart = changeCart(cart, (next) => next.updateQuantity('FOOD-001', 1))
  assert.equal(cart.getItemCount(), 2)
  cart = changeCart(cart, (next) => next.remove('FOOD-001'))
  assert.equal(cart.getSubtotal(), 120)
  assert.equal(cart.getItemCount(), 1)
  cart = changeCart(cart, (next) => next.clear())
  assert.equal(cart.getItemCount(), 0)
  assert.equal(cart.getSubtotal(), 0)
})

test('persistence stores only IDs and quantities and restores canonical class instances', () => {
  const storage = memoryStorage()
  assert.equal(saveCart(exampleCart(), storage).warning, null)
  assert.deepEqual(JSON.parse(storage.getItem(CART_STORAGE_KEY)), [
    { productId: 'FOOD-001', quantity: 2 }, { productId: 'FOOD-007', quantity: 1 },
  ])
  const { cart, warning } = loadCart(storage)
  assert.equal(warning, null)
  assert.ok(cart instanceof Cart)
  assert.ok(cart.items.every((item) => item instanceof CartItem))
  assert.equal(cart.items[0].product, products[0])
  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 410)
  assert.equal(cart.items[0].getLineTotal(), 290)
})

test('restoration ignores unknown IDs, invalid quantities and malformed entries', () => {
  const storage = memoryStorage()
  storage.setItem(CART_STORAGE_KEY, JSON.stringify([
    null, 1, {}, { productId: 'missing', quantity: 2 },
    { productId: 'FOOD-001' }, { productId: 'FOOD-001', quantity: 0 },
    { productId: 'FOOD-001', quantity: -1 }, { productId: 'FOOD-001', quantity: 1.5 },
    { productId: 'FOOD-001', quantity: '2' },
    { productId: 'FOOD-001', quantity: 2, price: 1 },
    { productId: 'FOOD-007', quantity: 1 },
  ]))
  const { cart, warning } = loadCart(storage)
  assert.equal(warning, 'partial-data')
  assert.equal(cart.getItemCount(), 3)
  assert.equal(cart.getSubtotal(), 410)
  assert.equal(cart.items[0].product.price, 145)
})

test('restoration merges duplicates and skips unavailable products', () => {
  const storage = memoryStorage([[CART_STORAGE_KEY, JSON.stringify([
    { productId: 'FOOD-001', quantity: 1 }, { productId: 'FOOD-001', quantity: 1 },
    { productId: 'BLOCKED', quantity: 2 },
  ])]])
  const catalog = [...products, new Product({ ...products[0], id: 'BLOCKED', available: false })]
  const { cart, warning } = loadCart(storage, catalog)
  assert.equal(warning, 'partial-data')
  assert.equal(cart.items.length, 1)
  assert.equal(cart.getItemCount(), 2)
})

test('missing or malformed storage produces a usable empty Cart', () => {
  assert.equal(loadCart(memoryStorage()).warning, null)
  for (const json of ['{', 'null', '{}', '42', '"cart"']) {
    const { cart, warning } = loadCart(memoryStorage([[CART_STORAGE_KEY, json]]))
    assert.equal(warning, 'invalid-data')
    assert.ok(cart instanceof Cart)
    assert.equal(cart.getItemCount(), 0)
  }
  assert.equal(loadCart(null).warning, 'read-failed')
  assert.equal(loadCart({ getItem() { throw new Error('Denied') } }).warning, 'read-failed')
})

test('failed writes are reported without losing in-memory contents or previous saved data', () => {
  const cart = exampleCart()
  const storage = memoryStorage([[CART_STORAGE_KEY, '[]']])
  storage.setItem = () => { throw new Error('Quota exceeded') }
  assert.equal(saveCart(cart, storage).warning, 'write-failed')
  assert.equal(saveCart(cart, null).warning, 'write-failed')
  assert.equal(storage.getItem(CART_STORAGE_KEY), '[]')
  assert.equal(cart.getSubtotal(), 410)
})

test('cart saves and clearing never overwrite confirmed-order storage', () => {
  const storage = memoryStorage([[ORDER_STORAGE_KEY, 'confirmed-order-sentinel']])
  const cart = exampleCart()
  saveCart(cart, storage)
  assert.notEqual(CART_STORAGE_KEY, ORDER_STORAGE_KEY)
  cart.clear()
  saveCart(cart, storage)
  assert.equal(storage.getItem(CART_STORAGE_KEY), '[]')
  assert.equal(storage.getItem(ORDER_STORAGE_KEY), 'confirmed-order-sentinel')
})
