const mongoose = require('mongoose');

const Review = mongoose.model('reviews', {
    title: {type: String, required: true},
    text: {type: String, required: true},
    score: {type: Number, required: true},
    productId: {type: mongoose.Schema.Types.ObjectId, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, required: true}
});

module.exports = Review;