import { Link } from 'react-router'
import { productImages } from '../../data/homeAssets.js'
import { homeContent } from '../../data/homeContent.js'
import { cartContent } from '../../data/cartContent.js'
import { formatCurrency } from '../../utils/currency.js'
import useCart from '../../hooks/useCart.js'

export default function FoodCard({ product, category }) {
  const { addToCart } = useCart()
  const image = product.image || productImages[product.id]
  return (
    <article className="flex h-full min-w-0 flex-col rounded-[24px] bg-white p-4 shadow-cafe transition-shadow hover:shadow-lg">
      <Link to={'/menu/' + product.id} className="flex flex-1 flex-col rounded-2xl">
        <div className="flex aspect-[1.85] items-center justify-center rounded-2xl p-5"
          style={{ backgroundColor: category.color }}>
          {image ? (
            <img src={image} alt={product.name + ' illustration'} width="240" height="160" loading="lazy"
              className="h-full max-h-40 w-full object-contain" />
          ) : (
            <span className="text-center text-sm text-muted">{homeContent.accessibility.foodPlaceholder}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col pt-3">
          <p className="text-xs text-muted">{category.name}</p>
          <h3 className="text-lg leading-snug font-extrabold">{product.name}</h3>
          <p className="mt-5 mb-8 text-sm text-muted">{product.description}</p>
        </div>
      </Link>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4 pb-1">
        <p className="text-lg font-extrabold">{formatCurrency(product.price)}</p>
        <button type="button" disabled={!product.available} aria-label={cartContent.addLabel(product.name)}
          onClick={() => addToCart(product)}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink bg-pink text-xl hover:bg-pink/75 disabled:opacity-50">
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </article>
  )
}
