export default class Category {
  constructor({ id, name, color, mascot }) {
    Object.assign(this, { id, name, color, mascot })
  }

  matches(product) {
    return product.categoryId === this.id
  }
}
