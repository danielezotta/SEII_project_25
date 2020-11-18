const express = require('express');
const router = express.Router();
const db = require('./db.js');
var jwt = require('jsonwebtoken');

// Filter authenticated users
router.use(function(req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token ||  req.params.token || req.headers['x-access-token'];
    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, 'passwordSuperSegretaPerGenerareIlToken', function(err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});

// Add a product to the database
router.post('', (req, res) => {
    let newProduct = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: req.body.price,
        amount: req.body.amount,
        userId: req.body.userId
    };

    //Parameters control

    if (!newProduct.name || typeof newProduct.name != 'string') {
        res.status(400).json({code: "400", message: 'The field "name" must be a non-empty string, in string format' });
        return;
    }
    if (!newProduct.image || typeof newProduct.image != 'string') {
        res.status(400).json({code: "400", message: 'The field "image" must be a non-empty string, in string format' });
        return;
    }
    if (!newProduct.description || typeof newProduct.description != 'string') {
        res.status(400).json({code: "400", message: 'The field "description" must be a non-empty string, in string format' });
        return;
    }
    if (!newProduct.price || isNaN(newProduct.price)) {
        res.status(400).json({code: "400", message: 'The field "price" must be a non-empty string, in number format' });
        return;
    }
    if (!newProduct.amount || isNaN(newProduct.amount) ) {
        res.status(400).json({code: "400", message: 'The field "amount" must be a non-empty string, in number format' });
        return;
    }
    if (!newProduct.userId) {
        res.status(400).json({code: "400", message: 'The field "userId" must be a non-empty string, in number format' });
        return;
    }
    var newProductId = db.products.insert(newProduct, function(data) {
        res.location("/api/v1/products/" + data._id).status(201).send();
    });

});

//Modify a product in the database
//Only the admins of the website and the seller of the product are authorized to update it

router.put('/:id', (req,res) =>{
    let updatedProduct = db.products.findOne(req.params.id, function(err,data){
        if(err){
          res.status(500).json({code: "500", message: "The request to the database gone wrong. Try later or contact us."});
          return;
        }
        if(!data){
          res.status(404).json({code: "404", message: "The product you want to update it's not in the database"});
          return;
        }
        if(req.body.name){
            if(typeof req.body.name != 'string'){
              res.status(400).json({code: "400", message: "The field 'name' is not a string"});
              return;
            }
            data.name = req.body.name;
        }
        if(req.body.image){
          if(typeof req.body.image != 'string'){
            res.status(400).json({code: "400", message: "The field 'image' is not a string"});
            return;
          }
          data.image = req.body.image;
        }
        if(req.body.description){
          if(typeof req.body.description != 'string'){
            res.status(400).json({code: "400", message: "The field 'description' is not a string"});
            return;
          }
          data.description = req.body.description;
        }
        if(req.body.price){
          if(isNaN(req.body.price)){
            res.status(400).json({code: "400", message: "The field 'price' is not a number"});
            return;
          }
          data.price = req.body.price;
        }
        if(req.body.amount){
          if(isNaN(req.body.amount)){
            res.status(400).json({code: "400", message: "The field 'amount' is not a number"});
            return;
          }
          data.amount = req.body.amount;
        }
        db.products.findOneAndUpdate(data, function(data){
          res.status(200).json(data);
        });
    });
});

//Remove a product from the database
//Only the admins of the website and the seller of the product are authorized to remove it

router.delete('/:id', (req,res) =>{
    let deletedProduct = db.products.findOne(req.params.id, function(err,data){
      if(err){
        res.status(500).json({code: "500", message: "The request to the database gone wrong. Try later or contact us."});
        return;
      }
      if(!data){
        res.status(404).json({code: "400", message: "The product you want to delete it's not in the database"});
        return;
      }
      db.products.delete(req.params.id, function(err,data){
        res.status(200).json({message: "success"});
      });
    });
});

module.exports = router;
