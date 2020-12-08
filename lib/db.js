const mongoose = require('mongoose');

//models
const Product = require('../models/product.js');
const User = require('../models/user.js');
const Order = require('../models/order.js');
const Review = require('../models/review.js');

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

//to manage reviews
const reviews = {
    // to get all reviews for a product
    findByProduct(productId, callback) {
        Review.find({"productId" : productId}).exec( (err, data) => {
            callback(err, data);
        });
    },
    // to add a review
    insert(newReview, callback) {
        const insertReview = new Review({ title: newReview.title, 
                                            text: newReview.text,
                                            score: newReview.score, 
                                            productId: newReview.productId,
                                            userId: newReview.userId });
        insertReview.save(function (err, data) {  
            callback(err, data);
        });
    },
    // to delete a review
    deleteOne(params, callback) {
        Review.findOneAndDelete(params).exec( (err, data) =>
            callback(err, data)
            );
    }
}

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
    products,
    orders,
    users,
    reviews
};
