const express = require( 'express' );
const router = express.Router();
const db = require( './db.js' );
var jwt = require( 'jsonwebtoken' );

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
			return;
		});
		return;
	});
});

// POST all product in the cart

module.exports = router;
