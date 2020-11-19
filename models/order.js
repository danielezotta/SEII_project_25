const mongoose = require('mongoose');

const Order = mongoose.model('orders', {

    id_user: { type: mongoose.Schema.Types.ObjectId, required: true },
    id_product: { type: mongoose.Schema.Types.ObjectId, required: true },
    address: { type: String, required: true },
    timeStamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    numCard: { type: Number, required: true },
    expCard: { type: String, required: true }

});

module.exports = Order;