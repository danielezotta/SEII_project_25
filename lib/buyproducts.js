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
				return res.status(403).json({ success: false, error: 'Failed to authenticate token.' });
			} else {
				if (id_user.match(/^[0-9a-fA-F]{24}$/)) {
					db.users.findOne({ "_id": id_user }, function (user) {
						if (!user) {
							return res.status(403).json({ success: false, error: 'User not found.' }).send();
						} else {
							req.decoded = decoded;
							next();
                        }
					});
				} else {
					return res.status(400).json({ success: false, error: 'User id bad format.' }).send();
                }

				
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

		return res.status(400).send(msg);
	}
});
//---

var new_order = function(newOrder, res){
	var newOrderId = db.orders.insert(newOrder, function (data) {
		res.location("/api/v1/orders/" + data._id).status(201).json({ success: true, "id_order": data._id }).send();
	});
}


// put the confirm of bought of product identified by _id in req.body
router.put('', (req, res) => { 
	let id_product = req.body.product_id;
	let address = req.body.address;
	let numCard = parseInt(req.body.numCard);
	let expCard = req.body.expCard;

	//process to controll format of body request
	if ( !id_product || typeof id_product != 'string' || !id_product.match(/^[0-9a-fA-F]{24}$/) ) {
		res.status(400).json({ success: false, field:"id_product", error: 'The field id_product must be a non-empty string, in string format' });
        return;
	}

	if (!address || typeof address != 'string') {
		res.status(400).json({ success: false, field:"address", error: 'The field address must be a non-empty string, in string format' });
		return;
	}

	if (!numCard || isNaN(numCard)) {
		res.status(400).json({ success: false, field:"numCard", error: 'The field numCard must be a non-empty string, in number format' });
		return;
	}

	if (!expCard || typeof expCard != 'string') {
		res.status(400).json({ success: false, field:"expCard", error:'The field expCard must be a non-empty string, in MM/YYYY format' });
		return;
	} else {
		let d = new Date();
		let exp = expCard.split("/");
		if (exp.length>2) {
			res.status(400).json({ success: false, field: "expCard", error: 'The field expCard must be a non-empty string, in MM/YYYY format' });
			return;
        }
		if (parseInt(exp[1]) < d.getFullYear()) {
			res.status(400).json({ success: false, field:"year", error: 'The current year can\'t be greater than expiry year' });
			return;
		} else {
			if (parseInt(exp[1]) == d.getFullYear() && parseInt(exp[0]) < d.getMonth()) {
				res.status(400).json({ success: false, field:"month", error: 'The current month can\'t be greater than expiry month' });
				return;
			}
        }
	}
	//---

	//proced to request to server
	var product = db.products.findOne(id_product, function (product) {
		if (!product) {
			return res.status(404).json({ success: false, message: 'Product not found.' });
		} else if (product) {
			let newOrder = {
				id_user: req.body.user_id,
				id_product: req.body.product_id,
				address: address,
				timeStamp: new Date(),
				numCard: numCard,
				expCard: expCard
			}
			

			var amount = product.amount;
			if( amount==1 ){ //last product available

				db.products.deleteOne(id_product, function (st) {
					if (!st) {
						return res.status(500).json({ success: false, message: 'Problem creation order' });
					}
					new_order(newOrder, res);
					return;
				});

			} else {

				amount = product.amount - 1;
				db.products.updateOne_amount(id_product, amount, function (st) {
					if (!st) {
						return res.status(500).json({ success: false, message: 'Problem creation order' });
					}
					new_order(newOrder, res);
					return;
				});

			}
			return;
		}
		
	});

});

module.exports = router;