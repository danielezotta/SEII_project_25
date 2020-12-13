const mongoose = require('mongoose');

const Cart = mongoose.model('carts', {
    amount: {type: Number, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = Cart;
