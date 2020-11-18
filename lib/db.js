const mongoose = require('mongoose');
const Product = require('../models/product.js');

var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};

mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));

const products = {
    insert(newProduct, callback) {
        const insertProduct = new Product({ name: newProduct.name, image: newProduct.image, description: newProduct.description, price: newProduct.price,
        amount:newProduct.amount, userId:newProduct.userId });
        insertProduct.save(function(err, data) {
            callback(data);
        });
    },
    find(id, callback) {
          Product.find({"_id" : id}).exec( (err, data) => {
              callback(data);
          });
    },
    findOne(id, callback) {
          Product.findOne({"_id" : id}).exec( (err, data) => {
              callback(err, data);
          });
    },
    findOneAndUpdate(updatedProduct,callback) {
          Product.findOneAndUpdate({"_id" : updatedProduct._id}, {$set:{name: updatedProduct.name, image: updatedProduct.image,
          description: updatedProduct.description, price: updatedProduct.price, amount: updatedProduct.amount} },{new:true}).exec( (err, data) => {
              callback(data);
          });
    },
    delete(id, callback){
          Product.remove({"_id": id}).exec((err, data) => {
              callback(err, data);
          });
    }
};

module.exports = {products};
