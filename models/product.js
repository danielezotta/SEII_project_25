const mongoose = require('mongoose');

const Product = mongoose.model('products', {

    name: { type: String, required: true },
    image: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true }

});

module.exports = Product;


/*
 * {
  "name" : "sad",
  "image": "s",
  "description": "sdasd",
  "price" : 45,
  "amount" : 5
}
 */