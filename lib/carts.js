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
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }

        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The user can't be found."
            });
            return;
        }

        res.status(200).json(data);
    });
});

// Put request for user cart amount edit
router.put('/:idproduct', (req, res) => {

    var amount = req.body.amount;

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
		if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }

        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The product can not be found."
            });
            return;
        }

		// Get the user cart info from db, 500 if db error, 404 if cart not found
		db.carts.findOneAndUpdate({"userId": req.headers['user-id'], "productId": req.params.idproduct}, {"amount": req.body.amount}, (err, data) => {
			if (err) {
				res.status(500).json({
					"code": "500",
					"message": "The request to the database gone wrong. Try later or contact us."
				});
				return;
			}

			if (!data) {
				res.status(404).json({
					"code": "404",
					"message": "The cart item can not be found."
				});
				return;
			}

			res.status(201).json(data);
			return;
		});

	});

});

// Delete request for user cart product remove
router.delete('/:idproduct', (req, res) => {

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
		if (err) {
			res.status(500).json({
				"code": "500",
				"message": "The request to the database gone wrong. Try later or contact us."
			});
			return;
		}

		if (!data) {
			res.status(404).json({
				"code": "404",
				"message": "The product can not be found."
			});
			return;
		}

	    // Get the user cart info from db, 500 if db error, 404 if cart not found
	    db.carts.deleteOne({"userId": req.headers['user-id'], "productId": req.params.idproduct}, (err, data) => {
	        if (err) {
	            res.status(500).json({
	                "code": "500",
	                "message": "The request to the database gone wrong. Try later or contact us."
	            });
	            return;
	        }

	        if (!data) {
	            res.status(404).json({
	                "code": "404",
	                "message": "The cart item can not be found."
	            });
	            return;
	        }

	        res.status(200).json({
				userId: req.headers['user-id'],
				productId: req.params.idproduct
			});
	    });
	});
});

module.exports = router;
