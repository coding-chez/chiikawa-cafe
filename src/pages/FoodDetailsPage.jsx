import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { catalogContent } from '../data/catalogContent.js'
import { products } from '../data/products.js'
import { categories } from '../data/categories.js'
import { productImages } from '../data/homeAssets.js'
import { getProductById } from '../utils/catalog.js'
import useCart from '../hooks/useCart.js'
import { cartContent } from '../data/cartContent.js'
import { formatCurrency } from '../utils/currency.js'

function ProductDetails({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart } = useCart()
  const content = catalogContent.details
  const category = categories.find((category) => category.matches(product))
  const image = product.image || productImages[product.id]
  const total = product.price * quantity

  function changeQuantity(value) {
    const next = Number(value)
    if (Number.isSafeInteger(next) && next >= 1) setQuantity(next)
  }

  return (
    <div className="content-width pt-5 pb-8 md:pt-6 md:pb-20">
      <nav aria-label={content.breadcrumbLabel} className="mb-5 text-sm md:text-base">
        <ol className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <li><Link to="/" className="inline-flex min-h-11 items-center text-muted hover:underline">{content.home}</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link to="/menu" className="inline-flex min-h-11 items-center text-muted hover:underline">{content.menu}</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-bold">{product.name}</li>
        </ol>
      </nav>
      <article className="grid min-w-0 items-center gap-6 rounded-[32px] bg-white p-5 shadow-cafe md:gap-10 md:p-10 lg:grid-cols-2 lg:py-14">
        <div className="flex aspect-square min-w-0 items-center justify-center rounded-[24px] p-8"
          style={{ backgroundColor: category.color }}>
          {image ? (
            <img src={image} alt={product.name + ' illustration'} width="310" height="310"
              className="h-full max-h-[310px] w-full max-w-[310px] object-contain" />
          ) : (
            <span className="text-center text-sm text-muted">{catalogContent.imagePlaceholder}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-muted md:text-base">{category.name} · {category.mascot}</p>
          <h1 className="mt-5 text-[32px] leading-tight font-extrabold md:mt-3 md:text-[44px]">{product.name}</h1>
          <p className="mt-5 text-[32px] leading-tight font-extrabold md:mt-3 md:text-[40px]">{formatCurrency(product.price)}</p>
          <p className="mt-6 text-muted">{product.description}</p>
          {product.ingredients.length > 0 && (
            <section aria-labelledby="ingredients-heading" className="mt-6">
              <h2 id="ingredients-heading" className="font-bold">{content.ingredients}</h2>
              <ul className="mt-2 list-inside list-disc text-muted">
                {product.ingredients.map((ingredient, index) => <li key={index}>{ingredient}</li>)}
              </ul>
            </section>
          )}
          <p className="mt-6 flex items-center gap-2 text-sm font-bold">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: category.color }} />
            {product.available ? content.available : content.unavailable}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <label htmlFor="product-quantity" className="font-bold">{content.quantity}</label>
            <div className="flex items-center rounded-full border border-ink">
              <button type="button" aria-label={content.decrease} disabled={quantity === 1}
                onClick={() => changeQuantity(quantity - 1)} className="quantity-button">−</button>
              <input id="product-quantity" type="number" min="1" step="1" max={Number.MAX_SAFE_INTEGER}
                inputMode="numeric" value={quantity} onChange={(event) => changeQuantity(event.target.value)}
                className="quantity-input min-h-12 w-14 bg-transparent text-center font-extrabold" />
              <button type="button" aria-label={content.increase} disabled={quantity === Number.MAX_SAFE_INTEGER}
                onClick={() => changeQuantity(quantity + 1)} className="quantity-button">+</button>
            </div>
          </div>
          <button type="button" disabled={!product.available} onClick={() => addToCart(product, quantity)} aria-describedby="detail-cart-note"
            className="mt-5 flex min-h-13 w-full items-center justify-center rounded-full bg-pink px-5 py-3 text-center font-extrabold hover:bg-pink/75 disabled:opacity-50">
            {content.addToCart} · <span className="ml-1" aria-live="polite">{formatCurrency(total)}</span>
          </button>
          <p id="detail-cart-note" className="mt-2 text-sm text-muted">{cartContent.detailsNote}</p>
          <Link to="/menu" className="mt-2 inline-flex min-h-12 items-center font-bold hover:underline">{content.back}</Link>
          <p className="mt-3 text-xs text-muted md:text-sm">{content.demo}</p>
        </div>
      </article>
    </div>
  )
}

export default function FoodDetailsPage() {
  const { productId } = useParams()
  const product = getProductById(products, productId)
  const content = catalogContent.details

  if (!product) {
    return (
      <section className="content-width py-16 text-center">
        <div className="rounded-[24px] bg-white px-6 py-12 shadow-cafe">
          <h1 className="text-3xl font-extrabold">{content.notFoundTitle}</h1>
          <p className="mt-4 text-muted">{content.notFoundDescription}</p>
          <Link to="/menu" className="button-primary mt-6">{content.back}</Link>
        </div>
      </section>
    )
  }

  // Remount only the detail panel when the route ID changes to reset local quantity.
  return <ProductDetails key={product.id} product={product} />
}
