import { Link } from 'react-router'
import { categories } from '../../data/categories.js'
import { productImages } from '../../data/homeAssets.js'
import { cartContent } from '../../data/cartContent.js'
import { homeContent } from '../../data/homeContent.js'
import { formatCurrency } from '../../utils/currency.js'
import useCart from '../../hooks/useCart.js'

export default function CartItemCard({ item }) {
  const { updateQuantity, removeFromCart, isCheckingOut, checkoutPending } = useCart()
  const locked = isCheckingOut || checkoutPending
  const { product, quantity } = item
  const category = categories.find((category) => category.matches(product))
  const image = product.image || productImages[product.id]

  return (
    <article data-product-id={product.id}
      className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] items-center gap-4 rounded-[24px] bg-white p-5 shadow-cafe min-[360px]:grid-cols-[96px_minmax(0,1fr)] xl:grid-cols-[112px_minmax(0,1fr)_auto_auto] xl:p-6">
      <div className="flex aspect-square items-center justify-center rounded-2xl p-2" style={{ backgroundColor: category.color }}>
        {image ? (
          <img src={image} alt={product.name + ' illustration'} width="112" height="112" className="h-full w-full object-contain" />
        ) : <span className="text-center text-xs text-muted">{homeContent.accessibility.foodPlaceholder}</span>}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted">{category.name}</p>
        <h2 className="mt-1 text-lg leading-snug font-extrabold">
          <Link to={'/menu/' + product.id} className="hover:underline">{product.name}</Link>
        </h2>
        <p className="mt-2 text-sm text-muted">{cartContent.each(formatCurrency(product.price))}</p>
      </div>
      <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 xl:contents">
        <div role="group" aria-label={cartContent.quantity(product.name)} className="flex w-fit items-center rounded-full border border-ink">
          <button type="button" aria-label={cartContent.decrease(product.name)} disabled={quantity === 1 || locked}
            onClick={() => updateQuantity(product.id, quantity - 1)} className="quantity-button">−</button>
          <output className="min-w-8 px-1 text-center font-extrabold">{quantity}</output>
          <button type="button" aria-label={cartContent.increase(product.name)} disabled={quantity === Number.MAX_SAFE_INTEGER || locked}
            onClick={() => updateQuantity(product.id, quantity + 1)} className="quantity-button">+</button>
        </div>
        <div className="text-right">
          <p className="text-lg font-extrabold" data-line-total>{formatCurrency(item.getLineTotal())}</p>
          <button type="button" disabled={locked} aria-label={cartContent.removeLabel(product.name)} onClick={() => removeFromCart(product.id)}
            className="min-h-11 text-sm text-muted hover:underline">{cartContent.remove}</button>
        </div>
      </div>
    </article>
  )
}
