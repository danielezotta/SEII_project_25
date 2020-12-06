const express = require( 'express' );
const router = express.Router();
const db = require( './db.js' );
var jwt = require( 'jsonwebtoken' );
var Order = require( '../models/order.js' );

// Authentication check
router.use( function( req, res, next ) {
    var token = req.headers['x-access-token'];
    
	if( token ){
		jwt.verify( token, 'SE2_project_25', function( err, decoded ) {
			if( err ){
				res.status( 403 ).json({
                    success: false,
                    message: 'Failed to authenticate token'
                }).send();
                return;
			}else{
                req.decoded = decoded;
                next();
			}
		});
	}else{
		res.status( 400 ).send({
			success: false,
			error: 'No token provided'
		}).send();
		return;
	}
});

// POST add product in the cart
router.post( '/:id', function(req, res){
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
			
			db.carts.findOne( {'productId': productId, 'userId': userId }, function( err, cart ){
				if( err ){
					res.status( 500 ).json( {
						success: false,
						message: 'The request to the database went wrong. Try later or contact us'
					}).send();
					return;
				}
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
									message: 'The product associated with user_id not found in cart'
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
				}else{
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
	var userId = req.headers['user-id'];
	
	if( !userId || typeof userId!='string' || !userId.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'User id bad format'
		}).send();
        return;
	}

	var address = req.body.address;
	var numCard = parseInt( req.body.numCard );
	var expCard = req.body.expCard;
	//process to controll format of body request
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
		db.carts.find({'userId': userId}, async function( err, data ){
			if( err ){
				res.status( 500 ).json( {
					success: false,
					message: 'The request to the database went wrong. Try later or contact us'
				}).send();
				return;
			}

			var empty = true;
			var val = true;
			//orders already create
			var cart_orders = [];
			//product that must be delete from cart
			var del_products = [];
			//product that must be update in cart
			var up_products = [];
			var i; var cart; var product;
			for( i=0; i<data.length; i++ ){
			//data.forEach( async function(cart){
				cart = data[i];
				empty = false;
				product = await db.products.findOne_async( {"_id":cart.productId} );
				//db.products.findOne( cart.productId, async function( err, product ){
				if( !product || product.amount==0 ){
					val = false;
					await db.carts.delete_async( {'userId':user._id, 'productId':product._id} );
					del_products.push( cart );
				}else if( product.amount<cart.amount ){
					val = false;
					await db.carts.updateOne_async( {'userId':user._id, 'productId':product._id}, {'amount': product.amount} );
					cart.amount = product.amount;
					up_products.push( cart );
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
					await db.products.updateOne_async( {"_id":cart.productId}, {"amount":product.amount} );
					var ord = await newOrder.save();
					cart_orders.push( ord );		
				}
			}
			if( val && !empty ){
				await db.carts.delete_async({'userId':user._id});
				res.status( 201 ).json( {"orders": cart_orders} ).send();
			}else if( !val && !empty ){
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

module.exports = router;
