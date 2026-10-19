// Only verified files under public/assets are referenced here.
// Keep presentation images separate so the existing catalog and model APIs stay unchanged.
export const characterImages = {
  Chiikawa: '/assets/characters/chiikawa.png',
  Usagi: '/assets/characters/usagi.png',
  Hachiware: '/assets/characters/hachiware.png',
  Momonga: '/assets/characters/momonga.png',
}

export const productImages = {
  'FOOD-001': '/assets/food/strawberry-cloud-cake.png',
  'FOOD-002': '/assets/food/honey-bunny-pancakes.png',
  'FOOD-003': '/assets/food/chocolate-bear-brownie.png',
  'FOOD-004': '/assets/food/cozy-omurice.png',
  'FOOD-005': '/assets/food/little-star-curry-rice.png',
  'FOOD-006': '/assets/food/creamy-mushroom-pasta.png',
  'FOOD-007': '/assets/food/peach-milk-float.png',
  'FOOD-008': '/assets/food/strawberry-milk.png',
  'FOOD-009': '/assets/food/iced-matcha-latte.png',
  'FOOD-010': '/assets/food/mini-cheese-toast.png',
  'FOOD-011': '/assets/food/crispy-potato-stars.png',
  'FOOD-012': '/assets/food/cinnamon-cookie-bites.png',
}

export const categoryImages = {
  DESSERTS: productImages['FOOD-001'],
  MEALS: productImages['FOOD-004'],
  DRINKS: productImages['FOOD-007'],
  // Preserve the approved Homepage decoration independently of product images.
  SNACKS: '/assets/food/cookie.png',
}
