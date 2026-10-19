import { useSearchParams } from 'react-router'
import FoodCard from '../components/food/FoodCard.jsx'
import { catalogContent } from '../data/catalogContent.js'
import { categories } from '../data/categories.js'
import { products } from '../data/products.js'
import { filterProducts, sortProducts, getCategoryFromSearchParams } from '../utils/catalog.js'

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const content = catalogContent.menu
  const categoryId = getCategoryFromSearchParams(searchParams, categories)
  const query = searchParams.get('q') ?? ''
  const requestedSort = searchParams.get('sort')
  const sortBy = content.sortOptions.some(({ value }) => value === requestedSort) ? requestedSort : 'default'
  const visibleProducts = sortProducts(filterProducts(products, { query, categoryId }), sortBy)
  const selectedCategory = categories.find(({ id }) => id === categoryId)
  const hasFilters = searchParams.has('category') || query !== '' || sortBy !== 'default'

  function updateParam(name, value, replace = false) {
    const next = new URLSearchParams(searchParams)
    if (!value || value === 'All' || value === 'default') next.delete(name)
    else next.set(name, value)
    setSearchParams(next, { replace, preventScrollReset: true })
  }

  return (
    <div className="content-width pt-8 pb-12 md:pt-20 md:pb-28">
      <header className="text-center">
        <h1 className="text-[28px] leading-tight font-extrabold md:text-[44px]">{content.title}</h1>
        <p className="mt-3 text-sm text-muted md:text-base">{content.subtitle}</p>
      </header>

      <form role="search" onSubmit={(event) => event.preventDefault()}
        className="mt-8 rounded-[24px] bg-white p-4 md:mt-20 md:p-5">
        <div className="grid min-w-0 gap-3 md:grid-cols-[1fr_240px] md:gap-6">
          <div className="relative min-w-0">
            <label htmlFor="menu-search" className="sr-only">{content.searchLabel}</label>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
              aria-hidden="true" className="pointer-events-none absolute top-4 left-4 size-5 text-muted">
              <circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" strokeLinecap="round" />
            </svg>
            <input id="menu-search" type="search" value={query}
              onChange={(event) => updateParam('q', event.target.value, true)}
              placeholder={content.searchPlaceholder}
              className="catalog-input pr-4 pl-12" />
          </div>
          <div className="flex min-h-13 min-w-0 items-center gap-2 rounded-2xl border border-ink/70 px-4 focus-within:outline-3 focus-within:outline-offset-4 focus-within:outline-ink">
            <label htmlFor="menu-sort" className="shrink-0 text-sm font-bold">{content.sortLabel}:</label>
            <select id="menu-sort" value={sortBy} onChange={(event) => updateParam('sort', event.target.value, true)}
              className="min-h-12 min-w-0 flex-1 bg-transparent text-sm font-bold focus-visible:outline-none">
              {content.sortOptions.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <fieldset className="mt-3 flex flex-wrap gap-2">
          <legend className="sr-only">{content.categoryLabel}</legend>
          <button type="button" aria-pressed={categoryId === 'All'} onClick={() => updateParam('category', 'All')}
            className={'category-chip ' + (categoryId === 'All' ? 'bg-pink' : 'bg-white')}>
            {content.all}
          </button>
          {categories.map((category) => (
            <button key={category.id} type="button" aria-pressed={categoryId === category.id}
              onClick={() => updateParam('category', category.id)}
              className="category-chip" style={{ backgroundColor: categoryId === category.id ? category.color : 'var(--color-white)' }}>
              {category.name}
            </button>
          ))}
        </fieldset>
      </form>

      <div className="mt-6 mb-8 flex flex-wrap items-center justify-between gap-3 text-sm">
        <p role="status" aria-live="polite" aria-atomic="true" className="font-extrabold">
          {content.resultCount(visibleProducts.length)}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-muted">{selectedCategory?.name ?? content.allCategories}</p>
          {hasFilters && <button type="button" onClick={() => setSearchParams({})}
            className="min-h-11 font-bold underline">{content.reset}</button>}
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <div id="menu-products" className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <FoodCard key={product.id} product={product}
              category={categories.find((category) => category.matches(product))} />
          ))}
        </div>
      ) : (
        <section aria-labelledby="empty-menu-heading" className="rounded-[24px] bg-white px-6 py-12 text-center shadow-cafe">
          <h2 id="empty-menu-heading" className="text-2xl font-extrabold">{content.emptyTitle}</h2>
          <p className="mt-3 text-muted">{content.emptyDescription}</p>
          <button type="button" onClick={() => setSearchParams({})} className="button-primary mt-6">{content.reset}</button>
        </section>
      )}
    </div>
  )
}
