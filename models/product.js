const mongoose = require('mongoose');

const Product = mongoose.model('products', {

    name: {type: String, required: true},
    image: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    amount: {type: Number, required: true}
});

module.exports = Product;
