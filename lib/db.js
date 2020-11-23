const mongoose = require('mongoose');
const Product = require('../models/product.js');
const User = require('../models/user.js');

var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};

mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));

const products = {
    find(id, callback) {
        Product.find({"_id" : id}).exec( (err, data) => {
            if (err) return console.log(err);
            callback(err, data);
        });
    },
    findOne(id, callback) {
        Product.findOne({"_id" : id}).exec( (err, data) => {
            if (err) return console.log(err);
            callback(err, data);
        });
    },
    all(callback) {
        Product.find().exec( (err, data) => {
            if (err) return console.log(err);
            callback(err, data);
        });
    }
};

// Portion of the file dedicated to users
const users = {
    // Insert new user in the db
    insert(user, callback) {
        const newUser = new User({ name: user.name, surname: user.surname, email: user.email, password: user.password });
        newUser.save(function(err, data) {
            callback(err, data);
        });
    },
    // Find one user by params in db
    findOne(params, callback) {
        User.findOne(params).exec( (err, data) => {
            callback(err, data);
        });
    },
    // Find one user by params and update by set
    findOneAndUpdate(params, set, callback) {
        User.findOneAndUpdate(params, set, {new: true}, (err, data) => {
            callback(err, data);
        });
    },
    // Find one user by params and delete it
    deleteOne(params, callback) {
        User.deleteOne(params).exec((err, data) => {
            callback(err, data);
        });
    }
}

module.exports = {
    users,
    products
};
