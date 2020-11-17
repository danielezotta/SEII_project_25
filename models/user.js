const mongoose = require('mongoose');

const User = mongoose.model('users', {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

module.exports = User;
