import Product from '../models/Product.js'

// Ingredients and images await verified product information and assets.
export const products = [
  new Product({"id":"FOOD-001","name":"Strawberry Cloud Cake","description":"Soft sponge cake with strawberry cream.","ingredients":[],"price":145,"image":"","categoryId":"DESSERTS","available":true}),
  new Product({"id":"FOOD-002","name":"Honey Bunny Pancakes","description":"Fluffy pancakes drizzled with sweet honey.","ingredients":[],"price":165,"image":"","categoryId":"DESSERTS","available":true}),
  new Product({"id":"FOOD-003","name":"Chocolate Bear Brownie","description":"Rich chocolate brownie with a soft center.","ingredients":[],"price":135,"image":"","categoryId":"DESSERTS","available":true}),
  new Product({"id":"FOOD-004","name":"Cozy Omurice","description":"Fluffy omelet over savory rice.","ingredients":[],"price":185,"image":"","categoryId":"MEALS","available":true}),
  new Product({"id":"FOOD-005","name":"Little Star Curry Rice","description":"Warm Japanese curry served with fluffy rice.","ingredients":[],"price":195,"image":"","categoryId":"MEALS","available":true}),
  new Product({"id":"FOOD-006","name":"Creamy Mushroom Pasta","description":"Creamy pasta with tender mushrooms.","ingredients":[],"price":210,"image":"","categoryId":"MEALS","available":true}),
  new Product({"id":"FOOD-007","name":"Peach Milk Float","description":"A creamy peach drink with a sweet finish.","ingredients":[],"price":120,"image":"","categoryId":"DRINKS","available":true}),
  new Product({"id":"FOOD-008","name":"Strawberry Milk","description":"Chilled milk blended with sweet strawberries.","ingredients":[],"price":110,"image":"","categoryId":"DRINKS","available":true}),
  new Product({"id":"FOOD-009","name":"Iced Matcha Latte","description":"Smooth matcha served over ice and milk.","ingredients":[],"price":135,"image":"","categoryId":"DRINKS","available":true}),
  new Product({"id":"FOOD-010","name":"Mini Cheese Toast","description":"Golden toast with warm melted cheese.","ingredients":[],"price":95,"image":"","categoryId":"SNACKS","available":true}),
  new Product({"id":"FOOD-011","name":"Crispy Potato Stars","description":"Crispy star-shaped potato bites.","ingredients":[],"price":105,"image":"","categoryId":"SNACKS","available":true}),
  new Product({"id":"FOOD-012","name":"Cinnamon Cookie Bites","description":"Bite-sized cookies with a cinnamon twist.","ingredients":[],"price":90,"image":"","categoryId":"SNACKS","available":true}),
]
