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
    //to associate an order of an user with a product
    insert(newProduct, callback) {
        const insertProduct = new Product({ name: newProduct.name, 
                                            image: newProduct.image, 
                                            description: newProduct.description, 
                                            price: newProduct.price, 
                                            amount: newProduct.amount,
                                            userId: newProduct.userId });
        insertProduct.save(function (err, data) {  
            callback(err, data);
        });
    },
    
    //to search a product by _id
    findOne(params, callback) {
        Product.findOne(params).exec( (err, data) =>
            callback(err, data)
            );
    },

    //to delete a product no available
    deleteOne(params, callback) {
        Product.findOneAndDelete(params).exec( (err, data) =>
            callback(err, data)
            );
    },

    //to update the number of availeble products
    updateOne_amount(params, updata, callback) {
        Product.findOneAndUpdate(params, updata, null).exec( (err, data) =>
            callback(err, data)
            );
    }
};

//to manage orders
const orders = {
    //to associate an order of an user with a product
    insert(newOrder, callback) {
        const insertOrder = new Order({ id_user: newOrder.id_user, 
                                        id_product: newOrder.id_product, 
                                        address: newOrder.address, 
                                        timeStamp: newOrder.timeStamp, 
                                        numCard: newOrder.numCard, 
                                        expCard: newOrder.expCard });
        insertOrder.save(function (err, data) {
            callback(err, data);
        });
    },

    //to delete an order
    deleteOne(params, callback) {
        Order.findOneAndDelete(params).exec( (err, data) =>
            callback(err, data)
            );
    }
};

//to manage users
//IMPORTANT: compare version with developer of users
const users = {
    insert(user, callback) {
        const newUser = new User({ name: user.name, surname: user.surname, email: user.email, password: user.password });
        newUser.save(function(err, data) {
            callback(err, data);
        });
    },

    findOne(params, callback) {
        User.findOne(params).exec( (err, data) =>
            callback(err, data)
            );
    },

    deleteOne(params, callback) {
        User.findOneAndDelete(params).exec( (err, data) =>
            callback(err, data)
            );
    }
};

module.exports = {
    products,
    orders,
    users
};
