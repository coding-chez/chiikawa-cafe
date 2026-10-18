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
  'FOOD-004': '/assets/food/cozy-omurice.png',
  'FOOD-007': '/assets/food/peach-milk-float.png',
  'FOOD-010': '/assets/food/cookie.png',
}

export const categoryImages = {
  DESSERTS: productImages['FOOD-001'],
  MEALS: productImages['FOOD-004'],
  DRINKS: productImages['FOOD-007'],
  SNACKS: productImages['FOOD-010'],
}
