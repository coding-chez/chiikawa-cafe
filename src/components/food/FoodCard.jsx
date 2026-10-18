import { Link } from 'react-router'
import { productImages } from '../../data/homeAssets.js'
import { homeContent } from '../../data/homeContent.js'
import { formatCurrency } from '../../utils/currency.js'

export default function FoodCard({ product, category }) {
  const image = product.image || productImages[product.id]
  return (
    <article className="h-full min-w-0">
      <Link to={'/menu/' + product.id}
        className="flex h-full flex-col rounded-[24px] bg-white p-4 shadow-cafe transition-shadow hover:shadow-lg">
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
          <p className="mt-auto pt-4 pb-2 text-lg font-extrabold">{formatCurrency(product.price)}</p>
        </div>
      </Link>
    </article>
  )
}
