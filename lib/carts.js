
const express = require( 'express' );
const router = express.Router();
const db = require( './db.js' );
var jwt = require( 'jsonwebtoken' );
var Order = require( '../models/order.js' );

// Authentication check
router.use('', require('./authentication_check.js'));

// POST add a product in the cart
router.post( '/:id', function(req, res){

	//parameters of request
	var productId = req.params.id;
	var userId = req.headers['user-id'];
	var amount = req.body.amount;

	//process to controll format of body request
	if( !productId || typeof productId!='string' || !productId.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Product id bad format'
		}).send();
        return;
	}

	if( !userId || typeof userId!='string' || !userId.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'User id bad format'
		}).send();
        return;
	}

	if( !amount || isNaN( amount ) || amount<1 ){
		res.status( 400 ).json( {
			success: false,
			error: 'The field amount must be a non-empty string, in number format >=1'
		}).send();
		return;
	}

	//search product in the database
	db.products.findOne( productId, function (err, product) {
		if( err ){
			res.status( 500 ).json( {
				success: false,
				message: 'The request to the database went wrong. Try later or contact us'
			}).send();
			return;
		}
		if( !product ){
			res.status( 404 ).json({
				success: false,
				message: 'Product not found'
			}).send();
			return;
		}
		if( product.amount==0 || product.amount<amount ){
			res.status( 404 ).json( {
				success: false,
				message: 'Product not available'
		 	}).send();
			return;
		}
		if( product.userId == userId ){
			res.status( 400 ).json( {
				success: false,
				error: 'Product cannot be bought from the same seller'
		 	}).send();
			return;
		}

		//search user in database
		db.users.findOne( {'_id': userId}, function (err, user) {
			if( err ){
				res.status( 500 ).json( {
					success: false,
					message: 'The request to the database went wrong. Try later or contact us'
				}).send();
				return;
			}
			if( !user ){
				res.status( 404 ).json({
					success: false,
					message: 'User not found'
				}).send();
				return;
			}

			//search in already exists same products in cart
			db.carts.findOne( {'productId': productId, 'userId': userId }, function( err, cart ){
				if( err ){
					res.status( 500 ).json( {
						success: false,
						message: 'The request to the database went wrong. Try later or contact us'
					}).send();
					return;
				}
				//already exists same products in cart
				if( cart ){
					var currentAmount = parseInt(cart.amount) + parseInt(amount);
					if( product.amount==0 || product.amount<currentAmount ){
						res.status( 404 ).json( {
							success: false,
							message: 'Product not available (this amount + amount in cart)'
						 }).send();
						return;
					}else{
						amount = currentAmount;
						db.carts.findOneAndUpdate( {
							'productId': productId,
							'userId': userId
						}, {
							'amount': amount
						}, function( err, data ){
							if( err ){
								res.status( 500 ).json({
									success: false,
									message: 'The request to the database went wrong. Try later or contact us'
								}).send();
								return;
							}
							if( !data ){
								res.status( 404 ).json({
									success: false,
									message: 'The product associated to user_id not found in cart'
								}).send();
								return;
							}
							res.status( 200 ).json( {
								success: true,
								message: 'update cart'
							}).send();
							return;
						});
					}
				}else{ //not exists same products in cart
					var newItemCart = {
						userId: userId,
						productId: productId,
						amount: amount
					};

					db.carts.insert( newItemCart, function ( err, data ) {
						if( err ){
							res.status( 500 ).json({
								success: false,
								message: 'The request to the database went wrong. Try later or contact us'
							}).send();
							return;
						}
						data['self'] = '/api/v1/carts/' + data['_id'];
						res.location('/api/v1/carts/' + data['_id']).status( 201 ).json( data ).send();
						return;
					});
				}
				return;
			});
			return;
		});
		return;
	});
});

// POST all product in the cart
router.post( '', function(req, res){

	//parameters of request
	var userId = req.headers['user-id'];
	var address = req.body.address;
	var numCard = parseInt( req.body.numCard );
	var expCard = req.body.expCard;

	//process to controll format of body request
	if( !userId || typeof userId!='string' || !userId.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'User id bad format'
		}).send();
        return;
	}

	if( !address || typeof address!='string'){
		res.status( 400 ).json( {
			success: false,
			error: 'The field address must be a non-empty string, in string format'
		}).send();
		return;
	}

	if( !numCard || isNaN( numCard ) || numCard<1 ){
		res.status( 400 ).json( {
			success: false,
			error: 'The field numCard must be a non-empty string, in number format'
		}).send();
		return;
	}

	if( !expCard || typeof expCard!='string' ){
		res.status( 400 ).json( {
			success: false,
			error:'The field expCard must be a non-empty string, in MM/YYYY format'
		}).send();
		return;
	}else{
		var d = new Date();
		var exp = expCard.split( '/' );
		if( exp.length!=2 || !exp ){
			res.status( 400 ).json( {
				success: false,
				error: 'The field expCard must be a non-empty string, in MM/YYYY format'
			}).send();
			return;
		}
		if( parseInt( exp[1] )<d.getFullYear() || isNaN( exp[1] ) || exp[1].length!=4 ){
			res.status( 400 ).json( {
				success: false,
				error: 'year not valid'
			}).send();
			return;
		}
		if( (parseInt( exp[1] )==d.getFullYear() && parseInt( exp[0] )<d.getMonth()) || isNaN( exp[0] ) || exp[0]<1 || exp[0]>12 ){
			res.status( 400 ).json( {
				success: false,
				error: 'month not valid'
			}).send();
			return;
		}
	}

	//search user in database
	db.users.findOne( {'_id': userId}, function (err, user) {
		if( err ){
			res.status( 500 ).json( {
				success: false,
				message: 'The request to the database went wrong. Try later or contact us'
			}).send();
			return;
		}

		if( !user ){
			res.status( 404 ).json({
				success: false,
				error: 'User not found'
			}).send();
			return;
		}

		//search products in cart associated to the user
		db.carts.find({'userId': userId}, async function( err, data ){
			if( err ){
				res.status( 500 ).json( {
					success: false,
					message: 'The request to the database went wrong. Try later or contact us'
				}).send();
				return;
			}

			//orders already create
			var cart_orders = [];
			//product that must be delete from cart
			var del_products = [];
			//product that must be update in cart
			var up_products = [];

			var empty = true;
			var val = true;

			var i; var cart; var product;
			for( i=0; i<data.length; i++ ){

				cart = data[i];
				empty = false;

				//search product in database
				product = await db.products.findOne_async( {"_id":cart.productId} );
				//product not exists or deleted
				if( !product || product.amount==0 ){
					val = false;
					//delete the product form cart
					await db.carts.delete_async( {'userId':user._id, 'productId':cart.productId} );
					if( !product ){
						product = {}
						product.name = `prodotto non più reperibile (${cart.productId})`;
					}
					del_products.push( product );

				}else if( product.amount<cart.amount ){ //product not available
					val = false;
					await db.carts.updateOne_async( {'userId':user._id, 'productId':product._id}, {'amount': product.amount} );
					cart.amount = product.amount;
					up_products.push( product );
				}

				if( val ){
					var newOrder = new Order({
						user_id: userId,
						product_id: cart.productId,
						address: address,
						amount: cart.amount,
						timeStamp: new Date(),
						numCard: numCard,
						expCard: expCard
					});
					product.amount = parseInt(product.amount) - parseInt(cart.amount);
					//update product in cart with valid amount
					await db.products.updateOne_async( {"_id":cart.productId}, {"amount":product.amount} );
					var ord = await newOrder.save();
					cart_orders.push( ord );
				}
			}
			if( val && !empty ){
				//bought all products in cart
				await db.carts.delete_async({'userId':user._id});
				res.status( 201 ).json( {"orders": cart_orders} ).send();
			}else if( !val && !empty ){
				//send of products deleted and products
				var i; var ord;
				for( i=0; i<cart_orders.length; i++ ){
					ord = cart_orders[i];
					product = await db.products.findOne_async( {"_id":ord.product_id} );
					product.amount = parseInt(ord.amount) + parseInt(product.amount)
					await db.products.updateOne_async( {"_id":product._id}, {"amount":product.amount} );
					await db.orders.delete_async( {"_id":ord._id} );
				}
				res.status( 404 ).json( {"del": del_products, "up": up_products} ).send();
			}else{
				res.status( 404 ).json({
					success: false,
					message: 'Products not found in cart'
				}).send();
			}
			return;
		});
		return;
	});
	return;
});

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
