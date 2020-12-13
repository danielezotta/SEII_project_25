const express = require('express');
const router = express.Router();
const db = require('./db.js');
var jwt = require('jsonwebtoken');

// Get all products in the database

router.get('', (req, res) => {
    // Check if it's a search request
    if (req.query.search) {
        // Get all products meeting search words
        const searchedProducts = db.products.search({name: {$regex : req.query.search, $options: 'i'}}, (err,data) => {
            // DB error, 500 status
            if (err) {
                res.status(500).json({
                    "code": "500",
                    "message": "The request to the database went wrong. Try later or contact us."
                });
                return;
            }
            res.status(200).json(data);
        });
    } else {
        const allProducts = db.products.all((err,data) => {
            if (err) {
                res.status(500).json({
                    "code": "500",
                    "message": "The request to the database went wrong. Try later or contact us."
                });
                return;
            }
            res.status(200).json(data);
        });
    }
});

// Get a specific product by id

router.get('/:id', (req, res) => {
    var product = db.products.findOne(req.params.id, (err, data) => {
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }
        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The product can't be found."
            });
            return;
        }
        res.status(200).json(data);
    });
});

// Authentication check
router.use('', require('./authentication_check.js'));

// Add a product to the database

router.post('', (req, res) => {
    let newProduct = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description,
        price: req.body.price,
        amount: req.body.amount,
        userId: req.headers['user-id']
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
    if(newProduct.price<=0){
      res.status(400).json({code: "400", message: 'The field "price" must be a positive number' });
      return;
    }
    if ((!newProduct.amount || isNaN(newProduct.amount)) && newProduct.amount!=0) {
        res.status(400).json({code: "400", message: 'The field "amount" must be a non-empty string, in number format' });
        return;
    }
    if(newProduct.amount<0){
      res.status(400).json({code: "400", message: 'The field "amount" must be a non-negative number' });
      return;
    }
    if (!newProduct.userId) {
        res.status(400).json({code: "400", message: 'The field "userId" must be a non-empty string, in number format' });
        return;
    }
    var newProductId = db.products.insert(newProduct, function(err, data) {
        if(err){
          res.status(500).json({code: "500", message: "The request to the database gone wrong. Try later or contact us."});
          return;
        }
        data["self"] = "/api/v1/products/" + data["_id"];
        res.status(201).json(data);
    });

});

//Modify a product in the database

router.put('/:id', (req,res) =>{
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The id is badly formatted."
        });
        return;
    }
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
        if(req.body.price || req.body.price==0){
          if(isNaN(req.body.price)){
            res.status(400).json({code: "400", message: "The field 'price' is not a number"});
            return;
          }
          if(req.body.price<=0){
            res.status(400).json({code: "400", message: 'The field "price" must be a positive number' });
            return;
          }
          data.price = req.body.price;
        }
        if(req.body.amount || req.body.amount==0){
          if(isNaN(req.body.amount)){
            res.status(400).json({code: "400", message: "The field 'amount' is not a number"});
            return;
          }
          if(req.body.amount<0){
            res.status(400).json({code: "400", message: 'The field "amount" must be a non-negative number' });
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

router.delete('/:id', (req,res) =>{
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The id is badly formatted."
        });
        return;
    }
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

//Get all the products sold by a specific user

router.get('/myProducts/:userId', (req,res)=>{
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The user id is badly formatted."
        });
        return;
    }
    const user = db.users.findOne({"_id":req.params.userId}, function(err,data){
      if (err) {
          res.status(500).json({
              "code": "500",
              "message": "The request to the database went wrong. Try later or contact us."
          });
          return;
      }
      if(!data){
          res.status(404).json({
            "code": "404",
            "message": "There not exists a user with that userId"
          });
          return;
      }
      const myProducts = db.products.findByUserId(req.params.userId, function(err,data){
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }
        if(!data){
            res.status(404).json({
              "code": "404",
              "message": "There are not products sold by this user"
            });
            return;
        }
        res.status(200).json(data);
      })
    })
});

//Get all the orders done by a specific user

router.get('/myOrders/:userId', (req,res)=>{
    if (!req.params.userId.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The user id is badly formatted."
        });
        return;
    }
    const user = db.users.findOne({"_id":req.params.userId}, function(err,data){
      if (err) {
          res.status(500).json({
              "code": "500",
              "message": "The request to the database went wrong. Try later or contact us."
          });
          return;
      }
      if(!data){
          res.status(404).json({
            "code": "404",
            "message": "There not exists a user with that userId"
          });
          return;
      }
      const myOrders = db.orders.find({"user_id":req.params.userId}, function(err,data){
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }
        if(!data){
            res.status(404).json({
              "code": "404",
              "message": "There are not orders done by this user"
            });
            return;
        }
        res.status(200).json(data);
      })
    })
});


module.exports = router;
