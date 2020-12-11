const mongoose = require('mongoose');

//models
const Product = require('../models/product.js');
const User = require('../models/user.js');
const Order = require('../models/order.js');
const Cart = require('../models/cart.js');

//database  connection
var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));
mongoose.set('useFindAndModify', false);

//to manage products
const products = {

    find(id, callback) {
        Product.find({"_id" : id}).exec( (err, data) => {
            callback(err, data);
        });
    },
    //to search a product by _id
    findOne(id, callback) {
        Product.findOne({"_id" : id}).exec( (err, data) => {
            callback(err, data);
        });
    },
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
    /*
    insert(newProduct, callback) {
        const insertProduct = new Product({ name: newProduct.name, image: newProduct.image, description: newProduct.description, price: newProduct.price,
        amount:newProduct.amount, userId:newProduct.userId });
        insertProduct.save(function(err, data) {
            callback(data);
        });
    },*/

    all(callback) {
        Product.find().exec( (err, data) => {
            callback(err, data);
        });
    },

    //to delete a product no available
    deleteOne(params, callback) {
        Product.findOneAndDelete(params).exec( (err, data) =>
            callback(err, data)
            );
    },
    delete(id, callback){
        Product.remove({"_id": id}).exec((err, data) => {
            callback(err, data);
        });
    },

    findOneAndUpdate(updatedProduct,callback) {
        Product.findOneAndUpdate({"_id" : updatedProduct._id}, {$set:{name: updatedProduct.name, image: updatedProduct.image,
        description: updatedProduct.description, price: updatedProduct.price, amount: updatedProduct.amount} },{new:true}).exec( (err, data) => {
            callback(data);
        });
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

    //to find all order with the specific id of user
    find(params, callback) {
        Order.find(params).exec( (err, data) => {
            callback(err, data);
        });
    },

    //to find an order with the specific id and user
    findOne(params, callback) {
        Order.findOne(params).exec( (err, data) => {
            callback(err, data);
        });
    },

    // Find one user by params and update by set
    findOneAndUpdate(params, set, callback) {
        Order.findOneAndUpdate(params, set, {new: true}, (err, data) => {
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

// Users db management
const users = {

    // Insert new user
    insert(user, callback) {
        const newUser = new User({ name: user.name, surname: user.surname, email: user.email, password: user.password });
        newUser.save(function(err, data) {
            callback(err, data);
        });
    },

    // Find user by params
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

// TODO: find, findOneAndUpdate, deleteOne
// Strap: insert,
const carts = {

    // Find all the items in the cart meeting params
    find(params, callback) {
        Cart.find(params).exec( (err, data) => {
            callback(err, data);
        });
    },

    // Find one item in the cart by params and update by set
    findOneAndUpdate(params, set, callback) {
        Cart.findOneAndUpdate(params, set, {new: true}, (err, data) => {
            callback(err, data);
        });
    },

    // Find one cart item by params and delete it
    deleteOne(params, callback) {
        Cart.deleteOne(params).exec((err, data) => {
            callback(err, data);
        });
    },
    //insert to add a product in user cart
    insert(newItemCart, callback) {
        const insertItem = new Cart({
            amount: newItemCart.amount,
            userId: newItemCart.userId,
            productId: newItemCart.productId
        });
        insertItem.save(function (err, data) {
            callback(err, data);
        });
    }
}

module.exports = {
    products,
    orders,
    users,
    carts
};
