const express = require('express');
const router = express.Router();
const db = require('./db.js');
var jwt = require('jsonwebtoken');

// Get all products in the database
router.get('', (req, res) => {
    const allProducts = db.products.all(function(data) {
        // console.log(data);
        res.status(200).json(data);
    });
});

// Get a specific product by id
router.get('/:id', (req, res) => {
    var product = db.products.find(req.params.id, function(data){
        // console.log(data);
        res.status(200).json(data);
    });
});

module.exports = router;
