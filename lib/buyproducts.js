const express = require('express');
const router = express.Router();
const db = require('./db.js');

var jwt = require('jsonwebtoken');
//key to create token
var key = "passwordSuperSegretaPerGenerareIlToken";

//--- test autentication of user
//IMPORTANTE: in this case, the user can send id of other user with his token
//it causes securety leak
router.use(function (req, res, next) {
	// check url parameters or post parameters for token and id_user
	var token = req.body.token || req.params.token || req.headers['x-access-token'];
	var id_user = req.body.user_id || req.params.user_id;

	// decode token
	if (token && id_user) {
		jwt.verify(token, key, function (err, decoded) {
			if (err) {
				console.log("ACCESS: block invalid token");
				return res.status(403).json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				var user = db.users.findOne({ "_id": id_user }, function (user) {
					if (!user) {
						return res.status(403).json({ success: false, message: 'User not found.' });
					} else if (user) {
						console.log('ACCESS: valid token for: id: ' + id_user + '; email: ' + user.email);
					}
				});

				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {
		let msg = {};
		msg.success = false;

		if (!token) {
			msg.token = 'No token provided';
		}
		if (!id_user) {
			msg.id_user = 'No id_user provided';
		}

		return res.status(403).send(msg);
	}
});
//---



// put the confirm of bought of product identified by _id in req.body
router.put('', (req, res) => { 
	let id_product = req.body.product_id;
	let address = req.body.address;

    if (!id_product || typeof id_product != 'string') {
        res.status(400).json({ error: 'The field "!id_product" must be a non-empty string, in string format' });
        return;
	}

	if (!address || typeof address != 'string') {
		res.status(400).json({ error: 'The field "!address" must be a non-empty string, in string format' });
		return;
	}

	var product = db.products.findOne(id_product, function (product) {
		let newOrder = {
			id_user: req.body.user_id,
			id_product: req.body.product_id,
			address: address,
			timeStamp: new Date()
		}


		if (!product) {
			return res.status(403).json({ success: false, message: 'Product not found.' });
		} else if (product) {

			var amount = product.amount;

			if( amount==1 ){

				db.products.deleteOne(id_product, function (st) {
					if (!st) {
						return res.status(500).json({ success: false, message: 'Problem creation order' });
					}
					var newOrderId = db.orders.insert(newOrder, function(data) {
						console.log("New order: id " + data._id);
						res.location("/api/v1/orders/" + data._id).status(201).send();
					});
					return;
				});

			} else {

				amount = product.amount - 1;
				db.products.updateOne_amount(id_product, amount, function (st) {
					if (!st) {
						return res.status(500).json({ success: false, message: 'Problem creation order' });
					}
					var newOrderId = db.orders.insert(newOrder, function(data) {
						console.log("New order: id " + data._id);
						res.location("/api/v1/orders/" + data._id).status(201).send();
					});
					return;
				});

			}
			return;
		}
		
	});

});

module.exports = router;