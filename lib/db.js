const mongoose = require('mongoose');

var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};

mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));

const Product = require('../models/product.js');
    
const products = {
    find(id, callback) {
        Product.find({"_id" : id}).exec( (err, data) => {
            if (err) return handleError(err);
            callback(data);
        });
    },
    findOne(id, callback) {
        Product.findOne({"_id" : id}).exec( (err, data) => {
            if (err) return handleError(err);
            callback(data);
        });
    },
    all(callback) {
        Product.find().exec( (err, data) => {
            if (err) return handleError(err);
            callback(data);
        });
    }
};
    
module.exports = {
    products
};
