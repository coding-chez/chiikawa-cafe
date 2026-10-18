export const homeContent = {
  navigation: [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/#about', label: 'About' },
    { to: '/cart', label: 'Cart' },
  ],
  hero: {
    eyebrow: 'WELCOME TO OUR LITTLE CAFÉ',
    title: 'A little treat, a lot of happiness ♡',
    description: "From fluffy pancakes to cozy rice meals, there's always something sweet waiting for you.",
    menu: 'Explore Menu',
    favorites: 'Our Favorites',
    charactersLabel: 'Meet our café friends',
  },
  categories: {
    title: 'Find your happy bite!',
    description: "Whatever you're craving, we've got a little something for you.",
  },
  featured: {
    title: 'Our little favorites ♡',
    description: 'The treats everyone keeps coming back for.',
  },
  about: {
    title: 'Every little bite brings a smile ♡',
    description: 'A cozy little corner filled with sweet treats, comforting meals, and tiny happy moments.',
    cta: 'Browse Our Menu',
  },
  footer: {
    tagline: 'A little treat, a lot of happiness.',
    demo: 'Unofficial site. No real purchases or orders are processed.',
    navigationLabel: 'Footer navigation',
  },
  accessibility: {
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    cart: 'Cart, 0 items',
    imagePlaceholder: 'Image coming soon',
    foodPlaceholder: 'Food illustration coming soon',
    characterAlt: (name) => name + ' character illustration',
    mascot: (name) => 'With ' + name,
  },
}
