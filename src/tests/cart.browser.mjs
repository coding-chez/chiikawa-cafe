// Start npm run dev first, then run npm run test:browser.
// Uses installed Edge by default; CART_QA_BROWSER can point to another Chromium browser.
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import assert from 'node:assert/strict'

const folder = await mkdtemp(join(tmpdir(), 'chiikawa-cart-qa-'))
const browser = spawn(process.env.CART_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', '--user-data-dir=' + folder, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
let ws
try {
  let port
  for (let i = 0; i < 100; i++) {
    try { port = (await readFile(join(folder, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break } catch { await pause(100) }
  }
  assert.ok(port)
  const targets = await (await fetch('http://127.0.0.1:' + port + '/json/list')).json()
  ws = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject })
  let nextId = 0
  const pending = new Map()
  const errors = []
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const entry = pending.get(message.id)
      if (entry) { pending.delete(message.id); message.error ? entry.reject(message.error) : entry.resolve(message.result) }
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text)
  }
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }
  async function evaluate(expression) {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails))
    return result.result.value
  }
  const run = (fn, ...args) => evaluate('(' + fn.toString() + ')(...' + JSON.stringify(args) + ')')
  async function until(expression) {
    for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await pause(50) }
    throw new Error('Timed out waiting for ' + expression)
  }
  async function navigate(path) {
    await send('Page.navigate', { url: (process.env.CART_QA_URL || 'http://127.0.0.1:5173') + path })
    await until('document.readyState === "complete" && !!document.querySelector("h1")')
    await evaluate('document.fonts.ready.then(() => true)')
    await evaluate('[...document.images].forEach(image => image.loading = "eager")')
    await until('[...document.images].every(image => image.complete)')
    await pause(100)
  }
  async function input(selector, value) {
    await run((selector, value) => {
      const element = document.querySelector(selector)
      const prototype = element.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value)
      element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
    }, selector, value)
    await pause(100)
  }
  async function clickText(selector, text) {
    await run((selector, text) => [...document.querySelectorAll(selector)].find(el => el.textContent.trim() === text).click(), selector, text)
    await pause(100)
  }
  async function spaNavigate(path) {
    await run((path) => { history.pushState(null, '', path); dispatchEvent(new PopStateEvent('popstate')) }, path)
    await pause(100)
  }
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Page.bringToFront')
  await send('Emulation.setFocusEmulationEnabled', { enabled: true })
  const checks = []
  const key = 'chiikawa-cafe-cart-v1'
  const orderKey = 'chiikawa-cafe.latest-order'
  const badge = () => run(() => [...document.querySelectorAll('[data-cart-badge]')].map(el => el.textContent.trim()))
  async function expectBadge(count) {
    await until('[...document.querySelectorAll("[data-cart-badge]")].every(el => el.textContent.trim() === ' + JSON.stringify(String(count)) + ')')
    assert.deepEqual(await badge(), [String(count), String(count)])
  }
  const cartTotal = () => run(() => document.querySelector('[data-cart-total]').textContent)
  async function addCard(name) {
    await run((name) => document.querySelector('button[aria-label="Add ' + name + ' to cart"]').click(), name)
    await pause(100)
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false })
  await navigate('/cart')
  assert.equal(await evaluate('!!document.getElementById("empty-cart-heading")'), true)
  assert.equal(await run(() => !!document.querySelector('button[aria-describedby="checkout-note"]')), false)
  await expectBadge(0)
  await run((key) => localStorage.setItem(key, 'confirmed-order-sentinel'), orderKey)
  checks.push('Empty cart provides Browse Menu and no checkout control')

  await navigate('/')
  await run(() => {
    const button = document.querySelector('button[aria-label="Add Strawberry Cloud Cake to cart"]')
    if (button.closest('a')) throw new Error('Add button must be separate from link')
    button.click()
    button.click()
  })
  await expectBadge(2)
  assert.equal(await evaluate('location.pathname'), '/')
  assert.match(await evaluate('document.querySelector("[data-cart-feedback]").textContent'), /Added/)
  checks.push('Homepage adds merge under rapid updates and never navigate')

  await navigate('/menu')
  await run(() => document.querySelector('button[aria-label="Add Peach Milk Float to cart"]').focus())
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, text: '\r' })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await expectBadge(3)
  assert.equal(await evaluate('location.pathname'), '/menu')
  assert.equal(await run(() => !!document.querySelector('article a button, article button a')), false)
  checks.push('Menu add is keyboard accessible and independent of the product link')

  await navigate('/cart')
  assert.equal(await evaluate('document.querySelectorAll("article[data-product-id]").length'), 2)
  assert.match(await cartTotal(), /410/)
  assert.equal(await evaluate('document.querySelector("[data-cart-item-count]").textContent'), '3')
  assert.equal(await run(() => document.querySelector('button[aria-describedby="checkout-note"]').disabled), true)
  assert.equal(await run((key) => localStorage.getItem(key), orderKey), 'confirmed-order-sentinel')
  assert.deepEqual(await run((key) => JSON.parse(localStorage.getItem(key)), key), [
    { productId: 'FOOD-001', quantity: 2 }, { productId: 'FOOD-007', quantity: 1 },
  ])
  checks.push('Refresh restores 2 rows, 3 units and PHP 410 without changing order storage')

  const layouts = []
  for (const width of [1440, 390, 375, 320]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false })
    await navigate('/cart')
    const layout = await run(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      imagesLoaded: [...document.images].every(img => img.naturalWidth > 0),
      rows: document.querySelectorAll('article[data-product-id]').length,
      navbar: document.querySelector('header').getBoundingClientRect().height,
    }))
    assert.ok(layout.scrollWidth <= layout.clientWidth, 'No overflow at ' + width)
    assert.equal(layout.imagesLoaded, true)
    assert.equal(layout.rows, 2)
    assert.equal(layout.navbar, width >= 768 ? 88 : 72)
    const size = (await send('Page.getLayoutMetrics')).cssContentSize
    const screenshot = await send('Page.captureScreenshot', {
      format: 'png', captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: size.height, scale: 1 },
    })
    const imagePath = join(folder, 'cart-' + width + '.png')
    await writeFile(imagePath, Buffer.from(screenshot.data, 'base64'))
    layouts.push({ width, ...layout, imagePath })
  }
  checks.push('Populated cart renders without overflow at 1440, 390, 375 and 320px')

  await run(() => document.querySelector('button[aria-label="Increase quantity of Strawberry Cloud Cake"]').click())
  await expectBadge(4)
  assert.match(await cartTotal(), /555/)
  await run(() => document.querySelector('button[aria-label="Decrease quantity of Strawberry Cloud Cake"]').click())
  await pause(100)
  await run(() => document.querySelector('button[aria-label="Decrease quantity of Strawberry Cloud Cake"]').click())
  await expectBadge(2)
  assert.match(await cartTotal(), /265/)
  assert.equal(await run(() => document.querySelector('button[aria-label="Decrease quantity of Strawberry Cloud Cake"]').disabled), true)
  await run(() => document.querySelector('button[aria-label="Remove Strawberry Cloud Cake from cart"]').click())
  await expectBadge(1)
  assert.match(await cartTotal(), /120/)
  await run(() => document.querySelector('button[aria-label="Remove Peach Milk Float from cart"]').click())
  await expectBadge(0)
  assert.equal(await evaluate('!!document.getElementById("empty-cart-heading")'), true)
  checks.push('Quantity minimum, separate removal, totals and badge update immediately')

  await navigate('/menu/FOOD-001')
  await input('#product-quantity', '2')
  await run(() => document.querySelector('button[aria-describedby="detail-cart-note"]').click())
  await expectBadge(2)
  assert.equal(await evaluate('location.pathname'), '/menu/FOOD-001')
  await spaNavigate('/menu/FOOD-007')
  assert.equal(await evaluate('document.querySelector("#product-quantity").value'), '1')
  await run(() => document.querySelector('button[aria-describedby="detail-cart-note"]').click())
  await expectBadge(3)
  await navigate('/cart')
  assert.match(await cartTotal(), /410/)
  await clickText('main button', 'Clear cart')
  await expectBadge(0)
  await pause(100)
  assert.deepEqual(await run((key) => JSON.parse(localStorage.getItem(key)), key), [])
  checks.push('Food Details adds selected quantity, resets on ID change and Clear cart persists')

  await run((key) => localStorage.setItem(key, '{'), key)
  await navigate('/cart')
  assert.equal(await evaluate('!!document.getElementById("empty-cart-heading")'), true)
  assert.match(await evaluate('document.querySelector("[data-cart-storage-warning]").textContent'), /could not be restored/)
  await run((key) => localStorage.setItem(key, JSON.stringify([
    { productId: 'UNKNOWN', quantity: 3 }, { productId: 'FOOD-001', quantity: 0 },
    { productId: 'FOOD-001', quantity: 2 },
  ])), key)
  await navigate('/cart')
  await expectBadge(2)
  assert.match(await cartTotal(), /290/)
  assert.equal(await evaluate('document.querySelectorAll("article[data-product-id]").length'), 1)
  checks.push('Malformed storage and unknown/invalid entries recover safely')

  const writeFailure = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'const originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(key, value) { if (key === "chiikawa-cafe-cart-v1") throw new DOMException("Storage quota exceeded", "QuotaExceededError"); return originalSetItem.call(this, key, value) }',
  })
  await navigate('/menu')
  await addCard('Peach Milk Float')
  await expectBadge(3)
  assert.match(await evaluate('document.querySelector("[data-cart-storage-warning]").textContent'), /could not be saved/)
  assert.deepEqual(await run((key) => JSON.parse(localStorage.getItem(key)), key), [{ productId: 'FOOD-001', quantity: 2 }])
  await run(() => document.querySelector('header a[href="/cart"]').click())
  await pause(100)
  assert.match(await cartTotal(), /410/)
  assert.equal(await run((key) => localStorage.getItem(key), orderKey), 'confirmed-order-sentinel')
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: writeFailure.identifier })
  checks.push('Failed writes preserve usable in-memory cart and display an honest warning')

  const deniedStorage = await send('Page.addScriptToEvaluateOnNewDocument', {
    source: 'Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Storage denied", "SecurityError") } })',
  })
  await navigate('/cart')
  await expectBadge(0)
  assert.equal(await evaluate('!!document.querySelector("[data-cart-storage-warning]")'), true)
  await clickText('main a', 'Browse Menu')
  await addCard('Strawberry Cloud Cake')
  await expectBadge(1)
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: deniedStorage.identifier })
  await navigate('/order-success')
  assert.match(await evaluate('document.querySelector("main").textContent'), /preview/i)
  assert.equal(await run((key) => localStorage.getItem(key), orderKey), 'confirmed-order-sentinel')
  assert.deepEqual(errors, [])
  checks.push('Denied storage does not crash the app; Order Success remains a placeholder')

  console.log(JSON.stringify({ checks, layouts, runtimeErrors: errors }, null, 2))
  await send('Browser.close')
} finally {
  ws?.close()
  browser.kill()
}
