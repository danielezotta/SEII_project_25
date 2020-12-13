const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Authentication check
router.use('', require('./authentication_check.js'));

// Get request for user cart
router.get('', (req, res) => {
    // Get the user cart info from db, 500 if db error, 404 if cart not found
    db.carts.find({"userId": req.headers['user-id']}, (err, data) => {
        // DB error, 500 status
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }
        // Cart not found, 404 status
        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The user can't be found."
            });
            return;
        }
        // Success, status 200 and array result
        res.status(200).json(data);
    });
});

// Put request for user cart amount edit
router.put('/:idproduct', (req, res) => {
    // Amount to edit
    var amount = req.body.amount;
    // Amount validity
    if (!amount || isNaN(amount) || amount < 1) {
        res.status(400).json({
            code: "400",
            message: 'The field "amound" must be a number, in string format'
        });
        return;
    }
	// Check if productId is formatted correctly
	if (!req.params.idproduct.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(400).json({
            code: "400",
            message: 'The id product is badly formatted'
		});
        return;
	}
	// Get product by id and check if existing
	db.products.findOne(req.params.idproduct, (err, data) => {
        // DB error, 500 status
		if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }
        // User not found, 404 status
        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The product can not be found."
            });
            return;
        }
		// Get the user cart info from db, 500 if db error, 404 if cart not found
		db.carts.findOneAndUpdate({"userId": req.headers['user-id'], "productId": req.params.idproduct}, {"amount": req.body.amount}, (err, data) => {
            // DB error, 500 status
			if (err) {
				res.status(500).json({
					"code": "500",
					"message": "The request to the database gone wrong. Try later or contact us."
				});
				return;
			}
            // Cart not found, 404 status
			if (!data) {
				res.status(404).json({
					"code": "404",
					"message": "The cart item can not be found."
				});
				return;
			}
            // Success, status 201 and updated cart
			res.status(201).json(data);
			return;
		});

	});

});

// Delete request for user cart product remove
router.delete('/:idproduct', (req, res) => {
	// Check if idproduct is formatted correctly
	if (!req.params.idproduct.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(400).json({
			code: "400",
			message: 'The id product is badly formatted'
		});
		return;
	}
	// Get product by id and check if existing
	db.products.findOne(req.params.idproduct, (err, data) => {
        // DB error, 500 status
		if (err) {
			res.status(500).json({
				"code": "500",
				"message": "The request to the database gone wrong. Try later or contact us."
			});
			return;
		}
        // User not found, 404 status
		if (!data) {
			res.status(404).json({
				"code": "404",
				"message": "The product can not be found."
			});
			return;
		}
	    // Get the user cart info from db, 500 if db error, 404 if cart not found
	    db.carts.deleteOne({"userId": req.headers['user-id'], "productId": req.params.idproduct}, (err, data) => {
            // DB error, 500 status
	        if (err) {
	            res.status(500).json({
	                "code": "500",
	                "message": "The request to the database gone wrong. Try later or contact us."
	            });
	            return;
	        }
            // User not found, 404 status
	        if (!data) {
	            res.status(404).json({
	                "code": "404",
	                "message": "The cart item can not be found."
	            });
	            return;
	        }
            // Success, status 200 and deleted cart
	        res.status(200).json({
				userId: req.headers['user-id'],
				productId: req.params.idproduct
			});
	    });
	});
});

module.exports = router;
