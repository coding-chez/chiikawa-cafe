export default class Product {
  constructor({ id, name, description, ingredients = [], price, image = '', categoryId, available = true }) {
    Object.assign(this, { id, name, description, ingredients: [...ingredients], price, image, categoryId, available })
  }

  matchesSearch(query = '') {
    const search = query.trim().toLowerCase()
    return this.name.toLowerCase().includes(search) || this.description.toLowerCase().includes(search)
  }

  belongsTo(categoryId) {
    return this.categoryId === categoryId
  }
}
