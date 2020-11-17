const mongoose = require('mongoose');

var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
    .catch(error => console.log(error));

//to manage products collection
const products = {
    //to search a product by _id
    findOne(id, callback) {
        Product.findOne({ "_id": id }).exec((err, data) => {
            if (err) return console.log(err);
            callback(data);
        });
    }
};

module.exports = {};
