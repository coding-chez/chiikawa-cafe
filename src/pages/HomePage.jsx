import { Link } from 'react-router'
import SectionHeading from '../components/common/SectionHeading.jsx'
import CharacterTile from '../components/common/CharacterTile.jsx'
import CategoryCard from '../components/food/CategoryCard.jsx'
import FoodCard from '../components/food/FoodCard.jsx'
import { homeContent } from '../data/homeContent.js'
import { categories } from '../data/categories.js'
import { products } from '../data/products.js'
import { categoryImages, productImages } from '../data/homeAssets.js'
import { getFeaturedProducts } from '../utils/catalog.js'

export default function HomePage() {
  const featuredProducts = getFeaturedProducts(products)
  const aboutProduct = featuredProducts[0]
  const aboutImage = aboutProduct.image || productImages[aboutProduct.id]

  return (
    <div className="content-width pt-6 pb-8 md:pt-12 md:pb-28">
      <section aria-labelledby="hero-heading" className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="flex flex-col justify-center rounded-[28px] bg-white px-6 py-7 shadow-cafe md:px-8 md:py-12 lg:min-h-[560px]">
          <p className="mb-5 text-xs font-semibold text-muted">{homeContent.hero.eyebrow}</p>
          <h1 id="hero-heading" className="text-[30px] leading-[1.16] font-extrabold tracking-tight sm:text-4xl lg:text-[54px]">
            {homeContent.hero.title}
          </h1>
          <p className="mt-6 text-sm text-muted md:text-base">{homeContent.hero.description}</p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <Link to="/menu" className="button-primary">{homeContent.hero.menu}</Link>
            <Link to="/#favorites" className="button-secondary">{homeContent.hero.favorites}</Link>
          </div>
        </div>
        <div role="group" aria-label={homeContent.hero.charactersLabel}
          className="flex flex-col justify-center rounded-[28px] bg-pink p-3 md:p-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {categories.map((category) => <CharacterTile key={category.id} category={category} />)}
          </div>
          <div aria-hidden="true" className="mt-4 hidden grid-cols-4 gap-5 lg:grid">
            {categories.map((category) => (
              <div key={category.id} className="flex h-[60px] items-center justify-center rounded-2xl"
                style={{ backgroundColor: category.color }}>
                {categoryImages[category.id] ? (
                  <img src={categoryImages[category.id]} alt="" width="64" height="48" className="h-12 w-16 object-contain" />
                ) : <span className="size-8 rounded-lg border border-ink/20 bg-white/60" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="categories-heading" className="mt-8 md:mt-20">
        <SectionHeading id="categories-heading" {...homeContent.categories} />
        <div className="mt-6 grid grid-cols-2 gap-4 md:mt-8 lg:grid-cols-4 lg:gap-6">
          {categories.map((category) => <CategoryCard key={category.id} category={category} />)}
        </div>
      </section>

      <section id="favorites" aria-labelledby="favorites-heading" className="mt-8 scroll-mt-6 md:mt-24">
        <SectionHeading id="favorites-heading" {...homeContent.featured} />
        <div className="mt-6 grid grid-cols-1 gap-6 md:mt-9 md:grid-cols-3">
          {featuredProducts.map((product) => (
            <FoodCard key={product.id} product={product}
              category={categories.find((category) => category.matches(product))} />
          ))}
        </div>
      </section>

      <section id="about" aria-labelledby="about-heading"
        className="mt-8 grid scroll-mt-6 items-center gap-6 rounded-[28px] bg-lavender p-6 shadow-cafe md:mt-32 md:grid-cols-[1.5fr_1fr] md:gap-14 md:px-16 md:py-10">
        <div>
          <h2 id="about-heading" className="text-2xl leading-tight font-extrabold md:text-4xl">{homeContent.about.title}</h2>
          <p className="mt-5 text-sm text-muted md:text-base">{homeContent.about.description}</p>
          <Link to="/menu" className="button-primary mt-5 w-full sm:w-fit">{homeContent.about.cta}</Link>
        </div>
        <div className="flex aspect-[2.1] items-center justify-center rounded-2xl bg-pink p-3">
          {aboutImage ? (
            <img src={aboutImage} alt={aboutProduct.name + ' illustration'} width="240" height="160"
              loading="lazy" className="h-full w-full object-contain" />
          ) : <span className="text-sm text-muted">{homeContent.accessibility.foodPlaceholder}</span>}
        </div>
      </section>
    </div>
  )
}
