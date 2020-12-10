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
    //to search a product by _id and return 
    find(params, callback) {
        Product.find(params).exec( (err, data) => {
            callback(err, data);
        });
    },

    //to search a product by _id
    findOne(id, callback) {
        Product.findOne({"_id" : id}).exec( (err, data) => {
            callback(err, data);
        });
    },

    //to create a product sell by an user
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

    //get all product in database
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
        Product.deleteOne({"_id": id}).exec((err, data) => {
            callback(err, data);
        });
    },

    findOneAndUpdate(updatedProduct,callback) {
        Product.findOneAndUpdate({"_id" : updatedProduct._id}, {$set:{name: updatedProduct.name, image: updatedProduct.image,
        description: updatedProduct.description, price: updatedProduct.price, amount: updatedProduct.amount} },{new:true}).exec( (err, data) => {
            callback(data);
        });
    },    

    //to update data of products
    updateOne(params, updata, callback) {
        Product.findOneAndUpdate(params, updata, null).exec( (err, data) =>
            callback(err, data)
        );
    },

    //to search a product by _id (async)
    async findOne_async(params) {
        return await Product.findOne( params ).exec();
    },

    //to update products (async)
    async updateOne_async(params, updata, callback) {
        return await Product.updateOne(params, updata, null).exec();
    }

};

//to manage orders
const orders = {
    //to create an order of an user of a product
    insert(newOrder, callback) {
        const insertOrder = new Order({ user_id: newOrder.user_id, 
                                        product_id: newOrder.product_id, 
                                        address: newOrder.address, 
                                        amount: newOrder.amount,
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

    //to one user by params and update by set
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
    },

    //to delete an order (async)
    async delete_async(params) {
        return await Order.deleteMany(params).exec();
    },
};

//to manage users
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

//to manage carts
const carts = {
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
    },

    // Find all the items in the cart
    find(params, callback) {
        Cart.find(params).exec( (err, data) => {
            callback(err, data);
        });
    },

    // Find a specific product in cart 
    findOne(params, callback) {
        Cart.findOne(params).exec( (err, data) => {
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

    // Find one item in the cart by params and update by set (async)
    async updateOne_async(params, set){
        return await Cart.updateOne(params, set, {new: true}).exec();
    },

    // Find one cart item by params and delete it(async)
    async delete_async(params) {
        return await Cart.deleteMany(params).exec();
    }
}

module.exports = {
    products,
    orders,
    users,
    carts
};
