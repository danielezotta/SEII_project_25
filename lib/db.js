const mongoose = require('mongoose');

//models
const Product = require('../models/product.js');
const User = require('../models/user.js');
const Order = require('../models/order.js');

//database  connection
var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));
mongoose.set('useFindAndModify', false);

//to manage products 
const products = {
    //to search a product by _id
    findOne(id, callback) {
        Product.findOne({ "_id": id }).exec((err, data) => {
            if (err) return console.log(err);
            callback(data);
        });
    },

    //to delete a product no available
    deleteOne(id, callback) {
        Product.findOneAndDelete({ "_id": id }, function (err, data) {
            if (err) {
                console.log(err)
            }
            else {
                console.log("DELETE product: ", id);
                callback(data);
            }
        });
    },

    //to update the number of availeble products
    updateOne_amount(id, amount, callback) {
        Product.findOneAndUpdate({"_id": id}, {amount: amount}, null, function (err, data) {
                if (err) {
                    console.log(err)
                } else {
                    console.log("UPDATE product: ", id);
                    callback(data);
                }
        }); 
    }
};

//to manage orders
const orders = {
    //to associate a order of a user with a product
    insert(newOrder, callback) {
        const insertOrder = new Order({ id_user: newOrder.id_user, id_product: newOrder.id_product, address: newOrder.address, timeStamp: newOrder.timeStamp, numCard: newOrder.numCard, expCard: newOrder.expCard });
        insertOrder.save(function (err, data) {
            callback(data);
        });
    } 
};

//to manage users
//IMPORTANTE: compare version with developer of users
const users = {
    findOne(params, callback) {
        User.findOne(params).exec((err, data) => {
            if (err) return console.log(err);
            callback(data);
        });
    }
};

module.exports = {
    products,
    orders,
    users
};
