export const featuredProductIds = ['FOOD-001', 'FOOD-004', 'FOOD-007']

export function filterProducts(products, { query = '', categoryId = 'All' } = {}) {
  return products.filter((product) =>
    (!categoryId || categoryId === 'All' || product.belongsTo(categoryId)) &&
    product.matchesSearch(query))
}

export function sortProducts(products, sortBy = 'default') {
  const result = [...products]
  const comparisons = {
    'price-low': (a, b) => a.price - b.price,
    'price-high': (a, b) => b.price - a.price,
    'name-asc': (a, b) => a.name.localeCompare(b.name),
  }
  if (comparisons[sortBy]) result.sort(comparisons[sortBy])
  return result
}

export function getFeaturedProducts(products) {
  return featuredProductIds.map((id) => getProductById(products, id)).filter(Boolean)
}

export function getProductById(products, id) {
  return products.find((product) => product.id === id)
}
