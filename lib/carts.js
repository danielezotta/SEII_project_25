const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Authentication check
router.use(function(req, res, next) {
	var token = req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, 'SE2_project_25', function(err, decoded) {
			if (err) {
				res.status(403).json({
                    success: false,
                    message: 'Failed to authenticate token.'
                });
                return;
			} else {
				req.decoded = decoded;
				next();
			}
		});
	} else {
		return res.status(401).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

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

        if (!data || data.length < 0) {
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
    });
});

// Delete request for user cart product remove
router.delete('/:idproduct', (req, res) => {

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

        res.status(200).json(data);
    });
});



module.exports = router;
