import { Link } from 'react-router'
import { categoryImages } from '../../data/homeAssets.js'
import { homeContent } from '../../data/homeContent.js'

export default function CategoryCard({ category }) {
  const image = categoryImages[category.id]
  return (
    <Link to={'/menu?category=' + category.id}
      className="flex min-h-[152px] flex-col items-center justify-center gap-3 rounded-[24px] border border-ink/70 p-5 text-center transition-shadow hover:shadow-md md:min-h-[170px]"
      style={{ backgroundColor: category.color }}>
      {image ? (
        <img src={image} alt="" width="64" height="56" loading="lazy" className="h-14 w-16 object-contain" />
      ) : (
        <span aria-hidden="true" className="flex h-14 w-16 items-center justify-center">
          <span className="size-10 rounded-xl border border-ink/20 bg-white/60" />
        </span>
      )}
      <span className="font-extrabold md:text-lg">{category.name}</span>
      <span className="sr-only">{homeContent.accessibility.mascot(category.mascot)}</span>
    </Link>
  )
}
