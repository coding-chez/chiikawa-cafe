import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { categories } from '../data/categories.js'
import { products } from '../data/products.js'
import { productImages, categoryImages } from '../data/homeAssets.js'
import { getCategoryFromSearchParams, filterProducts, sortProducts, getProductById } from '../utils/catalog.js'

test('category URL handling accepts all known IDs and falls back to All', () => {
  for (const category of categories) {
    const params = new URLSearchParams({ category: category.id })
    assert.equal(getCategoryFromSearchParams(params, categories), category.id)
    assert.equal(filterProducts(products, { categoryId: getCategoryFromSearchParams(params, categories) }).length, 3)
  }
  for (const query of ['', 'category=', 'category=All', 'category=UNKNOWN', 'category=desserts', 'category=%3Cscript%3E']) {
    const categoryId = getCategoryFromSearchParams(new URLSearchParams(query), categories)
    assert.equal(categoryId, 'All')
    assert.equal(filterProducts(products, { categoryId }).length, 12)
  }
})

test('category URL parsing preserves search/sort params and does not mutate them', () => {
  const params = new URLSearchParams('category=DRINKS&q=milk&sort=price-low')
  const before = params.toString()
  assert.equal(getCategoryFromSearchParams(params, categories), 'DRINKS')
  assert.equal(params.toString(), before)
  assert.equal(params.get('q'), 'milk')
  assert.equal(params.get('sort'), 'price-low')
})

test('combined trimmed search, category URL and price sorting preserves catalog', () => {
  const params = new URLSearchParams({ category: 'DRINKS', q: ' MiLk ', sort: 'price-high' })
  const original = [...products]
  const result = sortProducts(filterProducts(products, {
    query: params.get('q'),
    categoryId: getCategoryFromSearchParams(params, categories),
  }), params.get('sort'))
  assert.deepEqual(result.map((product) => product.id), ['FOOD-009', 'FOOD-007', 'FOOD-008'])
  assert.deepEqual(products, original)
  assert.notEqual(result, products)
})

test('all 12 detail route IDs resolve to the existing Product instances', () => {
  for (const product of products) assert.equal(getProductById(products, product.id), product)
  for (const id of ['missing', 'FOOD-000', 'FOOD-013', 'food-001', undefined]) {
    assert.equal(getProductById(products, id), undefined)
  }
})

test('all catalog image mappings reference verified PNG files and preserve Homepage cookie', () => {
  assert.deepEqual(Object.keys(productImages), products.map((product) => product.id))
  const signature = [137, 80, 78, 71, 13, 10, 26, 10]
  for (const product of products) {
    const path = productImages[product.id]
    assert.ok(path.startsWith('/assets/food/'))
    const data = readFileSync(new URL('../../public' + path, import.meta.url))
    assert.deepEqual([...data.subarray(0, 8)], signature)
  }
  assert.equal(productImages['FOOD-010'], '/assets/food/mini-cheese-toast.png')
  assert.equal(categoryImages.SNACKS, '/assets/food/cookie.png')
})
