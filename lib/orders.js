const express = require( 'express' );
const router = express.Router();
const db = require( './db.js' );
var jwt = require( 'jsonwebtoken' );

// Authentication check
router.use( function( req, res, next ) {
	var token = req.headers['x-access-token'];
	var user = req.headers['user-id'];

	if( token && user ){
		jwt.verify( token, 'SE2_project_25', function( err, decoded ) {
			if( err ){
				res.status( 403 ).json({
                    success: false,
                    message: 'Failed to authenticate token'
                }).send();
                return;
			}else{
				if( user.match( /^[0-9a-fA-F]{24}$/  ) && (typeof user=='string') ){
					db.users.findOne( { '_id': user }, function (err, data) {
						if( err ){
							not_found = 1;
							res.status( 500 ).json({
								success: false,
								message: 'The request to the database went wrong. Try later or contact us'
							}).send();
							return;
						}
						if( !data ){
							not_found = 1;
							res.status( 404 ).json({
								success: false,
								error: 'User not found' }
							).send();
							return;
						}
						req.decoded = decoded;
						next();
					});
				}else{
					res.status( 400 ).json({
						success: false,
						error: 'User id bad format'
					}).send();
					return;
                }
			}
		});
	}else{
		res.status( 400 ).send({
			success: false,
			error: 'No token or user_id provided'
		}).send();
		return;
	}
});

// POST the confirm a bought of product identified by _id in req.body
router.post( '', ( req, res ) => {
	var product_id = req.body.product_id;
	var address = req.body.address;
	var numCard = parseInt( req.body.numCard );
	var expCard = req.body.expCard;
	var amount = parseInt( req.body.amount );

	//process to controll format of body request
	if( !product_id || typeof product_id!='string' || !product_id.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Product id bad format'
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

	if( !amount || isNaN( amount ) || amount<1 ){
		res.status( 400 ).json( {
			success: false,
			error: 'The field amount must be a non-empty string, in number format >=1'
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
	//---

	//proced to request to server
	db.products.findOne( product_id, function (err, product) {
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
		if( product.userId == req.headers['user-id'] ){
			res.status( 400 ).json( {
				success: false,
				error: 'Product cannot be bought from the same seller'
		 	}).send();
			return;
		}
	
		var date = new Date(); 
		var now_utc =  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),
 								parseInt(date.getUTCHours())+1, date.getUTCMinutes(), date.getUTCSeconds());
		
		var newOrder = {
			user_id: req.headers['user-id'],
			product_id: req.body.product_id,
			address: address,
			amount: amount,
			timeStamp: new Date(now_utc),
			numCard: numCard,
			expCard: expCard
		};

		var new_amount = product.amount - amount;
		db.products.updateOne({'_id': product_id}, {'amount': new_amount}, function (err, st) {
			if(err){
				res.status( 500 ).json({
					success: false,
					message: 'The request to the database went wrong. Try later or contact us'
				}).send();
				return;
			}
			db.orders.insert( newOrder, function ( err, data ) {
				if( err ){
					res.status( 500 ).json({
						success: false,
						message: 'The request to the database went wrong. Try later or contact us'
					}).send();
					return;
				}
				data['self'] = '/api/v1/orders/' + data['_id'];
				res.location('/api/v1/orders/' + data['_id']).status( 201 ).json( data ).send();
				return;
			});
			return;
		});
		return;
	});
	return;
});

//GET all orders of an user
router.get( '', ( req, res ) => {
	db.orders.find( {
		'user_id': req.headers['user-id']
	}, function( err, data ){
		if( err ){
			res.status( 500 ).json({
				success: false,
				message: 'The request to the database went wrong. Try later or contact us'
			}).send();
			return;
		}
		if( !data && data.lenght==0 ){
			res.status( 404 ).json({
				success: false,
				message: 'No order associated with user_id'
			}).send();
			return;
		}
		res.status(200).json(data).send();
		return;
	});
	return;	
});

// GET product with id if it is associated with current user id
router.get( '/:id', ( req, res ) => {
	var order_id = req.params.id;
	if(  !order_id.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Order id bad format'
		}).send();
        return;
	}
	db.orders.findOne( {
		'_id': req.params.id,
		'user_id': req.headers['user-id']
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
				message: 'The order associated with user_id not found'
			}).send();
			return;
		}
		data['self'] = '/api/v1/orders/' + data['_id'];
        res.location('/api/v1/orders/' + data['_id']).status( 200 ).json( data ).send();
		return;
	});	
	return;
});

// PUT to edit the address of an order
router.put( '/:id', ( req, res ) => {
	var address = req.body.address; 
	if( !address || typeof address!='string'){
		res.status( 400 ).json( {
			success: false,
			error: 'The field address must be a non-empty string, in string format'
		}).send();
		return;
	}

	var order_id = req.params.id;
	if(  !order_id.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Order id bad format'
		}).send();
        return;
	}

	db.orders.findOneAndUpdate( {
		'_id': req.params.id,
		'user_id': req.headers['user-id']
	}, {
		address: req.body.address
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
				message: 'The order associated with user_id not found'
			}).send();
			return;
		}
		res.status( 200 ).json( {
			success: true,
			message: 'update order'
		}).send();
		return;
	});
	return;
});

// delete to delete an order of a specific user
router.delete( '/:id', ( req, res ) => {
	var order_id = req.params.id;
	
	if(  !order_id.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Order id bad format'
		}).send();
        return;
	}
	
	db.orders.findOne( {'_id': req.params.id, 'user_id': req.headers['user-id']} , function (err, order) {
		if( err ){
			res.status( 500 ).json( {
				success: false,
				message: 'The request to the database went wrong. Try later or contact us'
			}).send();
			return;
		}
		if( !order ){
			res.status( 404 ).json({
				success: false,
				message: 'The order associated with user_id not found'
			}).send();
			return;
		}
		var product_id = order.product_id;
		var amount = order.amount;
		db.products.findOne( product_id, function (err, product) {
			if( err ){
				res.status( 500 ).json( {
					success: false,
					message: 'The request to the database went wrong. Try later or contact us'
				}).send();
				return;
			}
			if( product ){
				var new_amount = product.amount + amount;
				db.products.updateOne({'_id': product_id}, {'amount': new_amount}, function (err, st) {
					if(err){
						res.status( 500 ).json({
							success: false,
							message: 'The request to the database went wrong. Try later or contact us'
						}).send();
						return;
					}
					return;
				});
			}
			db.orders.deleteOne({
				'_id': order_id
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
						message: 'The order associated with user_id not found'
					}).send();
					return;
				}
				res.status( 200 ).json( {
					success:true, 
					message: 'order deleted'
				}).send();
				return;
			});
			return;
	});
		return;
	});
	return;
});

module.exports = router;
