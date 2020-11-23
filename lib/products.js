const express = require('express');
const router = express.Router();
const db = require('./db.js');
var jwt = require('jsonwebtoken');

// Get all products in the database
router.get('', (req, res) => {
    const allProducts = db.products.all((err,data) => {
        // console.log(data);
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }

        res.status(200).json(data);
    });
});

// Get a specific product by id
router.get('/:id', (req, res) => {
    var product = db.products.findOne(req.params.id, (err, data) => {
        // console.log(data);
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

module.exports = router;
