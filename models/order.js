const mongoose = require('mongoose');

const Order = mongoose.model('orders', {

    user_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    product_id: {type: mongoose.Schema.Types.ObjectId, required: true},
    address: {type: String, required: true},
    timeStamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    numCard: {type: Number, required: true},
    expCard: {type: String, required: true},
    amount: {type: Number, require: true}

});

module.exports = Order;