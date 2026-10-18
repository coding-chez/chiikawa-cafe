export const siteContent = {
  name: 'Chiikawa Café',
  navigationLabel: 'Main navigation',
  skipLink: 'Skip to content',
  disclaimer: 'Not affiliated with or endorsed by Chiikawa or its rights holders.',
  navigation: [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/menu/placeholder', label: 'Food details' },
    { to: '/cart', label: 'Cart' },
    { to: '/order-success', label: 'Order success' },
  ],
  pages: {
    home: {
      title: 'Home',
      description: 'Welcome to the Chiikawa Café. This milestone establishes the project initial foundation.',
    },
    menu: {
      title: 'Menu',
      description: 'The café menu will be added in a future milestone.',
    },
    foodDetails: {
      title: 'Food details',
      description: 'This is the placeholder for an individual menu item. Product information will be added later.',
    },
    cart: {
      title: 'Cart',
      description: 'The cart page is ready for a future milestone. Shopping functionality is not available yet.',
    },
    orderSuccess: {
      title: 'Order success',
      description: 'This is a preview of the future confirmation page. No order has been placed.',
    },
    notFound: {
      title: 'Page not found',
      description: 'This address does not match a page. Use the navigation to return to the café.',
    },
  },
}
