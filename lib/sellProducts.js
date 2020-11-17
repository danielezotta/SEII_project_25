const express = require('express');
const router = express.Router();
const db = require('./db.js');
var jwt = require('jsonwebtoken');

// Filter authenticated users
/*router.use(function(req, res, next) {
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
});*/

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
    //console.log(Number(newProduct.amount));
    if (!newProduct.name || typeof newProduct.name != 'string') {
        res.status(400).json({ error: 'The field "name" must be a non-empty string, in string format' });
        return;
    }

    if (!newProduct.image || typeof newProduct.image != 'string') {
        res.status(400).json({ error: 'The field "image" must be a non-empty string, in string format' });
        return;
    }

    if (!newProduct.description || typeof newProduct.description != 'string') {
        res.status(400).json({ error: 'The field "description" must be a non-empty string, in string format' });
        return;
    }

    if (!newProduct.price || isNaN(newProduct.price)) {
        //console.log(typeof Number(newProduct.price));
        res.status(400).json({ error: 'The field "price" must be a non-empty string, in number format' });
        return;
    }
    //console.log(Number(newProduct.amount));
    if (!newProduct.amount || isNaN(newProduct.amount) ) {
        res.status(400).json({ error: 'The field "amount" must be a non-empty string, in number format' });
        return;
    }

    if (!newProduct.userId) {
        res.status(400).json({ error: 'The field "userId" must be a non-empty string, in number format' });
        return;
    }

    var newProductId = db.products.insert(newProduct, function(data) {
        //console.log(data._id);
        res.location("/api/v1/products/" + data._id).status(201).send();
    });

});

//Modify a product in the database

router.put('/:id', (req,res) =>{
    //console.log(req.params.id);
    let updatedProduct = db.products.findOne(req.params.id, function(data){
        //console.log(data.name);
        if(req.body.name){
            data.name = req.body.name;
        }
        if(req.body.image){
            data.image = req.body.image;
        }
        if(req.body.description){
          data.description = req.body.description;
        }
        if(req.body.price){
          data.price = req.body.price;
        }
        if(req.body.amount){
          data.amount = req.body.amount;
        }

        db.products.findOneAndUpdate(data, function(data){
          //console.log(data);
          res.status(200).json(data);
        });
    });


    /*console.log(updatedProduct.name);
    console.log(updatedProduct.image);
    console.log(updatedProduct.description);
    console.log(updatedProduct.price);
    console.log(updatedProduct.amount);*/
  });

module.exports = router;
