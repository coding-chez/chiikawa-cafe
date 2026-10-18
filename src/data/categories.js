import Category from '../models/Category.js'

export const categories = [
  new Category({ id: 'DESSERTS', name: 'Desserts', color: '#E8B8CC', mascot: 'Chiikawa' }),
  new Category({ id: 'MEALS', name: 'Meals', color: '#F4E68A', mascot: 'Usagi' }),
  new Category({ id: 'DRINKS', name: 'Drinks', color: '#B7D8F1', mascot: 'Hachiware' }),
  new Category({ id: 'SNACKS', name: 'Snacks', color: '#CDAFDE', mascot: 'Momonga' }),
]
