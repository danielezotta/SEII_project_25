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
                    message: 'Failed to authenticate token.'
                }).send();
                return;
			}else{
				if( user.match( /^[0-9a-fA-F]{24}$/ ) ){
					db.users.findOne( { "_id": user }, function (err, data) {
						if( err ){
							res.status( 500 ).json({
								success: false,
								message: 'The request to the database went wrong. Try later or contact us.'
							}).send();
							return;
						}
						if( !data ){
							res.status( 404 ).json({
								success: false,
								error: 'User not found' }
							).send();
							return;
						}else{
							req.decoded = decoded;
							next();
                        }
					});
				}else{
					res.status( 400 ).json({
						success: false,
						field: "user_id",
						error: 'User id bad format'
					}).send();
					return;
                }
			}
		});
	}else{
		res.status( 400 ).send({
			success: false,
			field: "token id_user",
			error: 'No token or id_user provided.'
		}).send();
		return;
	}
});


// New order
var new_order = function( newOrder, res ){
	var newOrderId = db.orders.insert( newOrder, function ( err, data ) {
		if( err ){
			res.status( 500 ).json({
				success: false,
				message: 'The request to the database went wrong. Try later or contact us.'
			}).send();
			return;
		}
		data["self"] = "/api/v1/users/" + data["_id"];
        res.location("/api/v1/orders/" + data["_id"]).status( 201 ).json( data ).send();
	});
}


// POST the confirm of bought of product identified by _id in req.body
router.post( '', ( req, res ) => {
	let id_product = req.body.product_id;
	let address = req.body.address;
	let numCard = parseInt( req.body.numCard );
	let expCard = req.body.expCard;

	//process to controll format of body request
	if( !id_product || typeof id_product!='string' || !id_product.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			field:"id_product",
			error: 'Product id bad format'
		} ).send();
        return;
	}

	if( !address || typeof address!='string'){
		res.status( 400 ).json( {
			success: false,
			field:"address",
			error: 'The field address must be a non-empty string, in string format'
		} ).send();
		return;
	}

	if(!numCard || isNaN( numCard ) || numCard<1 ){
		res.status( 400 ).json( {
			success: false,
			field:"numCard",
			error: 'The field numCard must be a non-empty string, in number format'
		} ).send();
		return;
	}

	if( !expCard || typeof expCard!='string' ){
		res.status( 400 ).json( {
			success: false,
			field:"expCard",
			error:'The field expCard must be a non-empty string, in MM/YYYY format'
		} ).send();
		return;
	}else{
		let d = new Date();
		let exp = expCard.split( "/" );
		if( exp.length>2 ){
			res.status( 400 ).json( {
				success: false,
				field: "expCard",
				error: 'The field expCard must be a non-empty string, in MM/YYYY format'
			} ).send();
			return;
        }
		if( parseInt( exp[1] )<d.getFullYear() || isNaN( exp[1] ) ){
			res.status( 400 ).json( {
				success: false,
				field:"year",
				error: 'The current year can\'t be greater than expiry year'
			} ).send();
			return;
		}else{
			if( (parseInt( exp[1] )==d.getFullYear() && parseInt( exp[0] )<d.getMonth()) || isNaN( exp[0] ) || exp[0]>12 ){
				res.status( 400 ).json( {
					success: false,
					field:"month",
					error: 'The current month can\'t be greater than expiry month and < 12'
				} ).send();
				return;
			}
        }
	}
	//---

	//proced to request to server
	var product = db.products.findOne( id_product, function (err, product) {
		if( err ){
			res.status( 500 ).json( {
				success: false,
				message: 'The request to the database went wrong. Try later or contact us.'
			} ).send();
			return;
		}
		if( !product ){
			res.status( 404 ).json({
				success: false,
				message: 'Product not found.'
			} ).send();
			return;
		}else{
			let newOrder = {
				id_user: req.headers['user-id'],
				id_product: req.body.product_id,
				address: address,
				timeStamp: new Date(),
				numCard: numCard,
				expCard: expCard
			};
			var amount = product.amount;
			if( amount==1 ){ //last product available
				db.products.deleteOne( {"_id": id_product}, function (err, st) {
					if( err ){
						res.status( 500 ).json( {
							success: false,
							message: 'The request to the database went wrong. Try later or contact us.'
						} ).send();
						return;
					}

					if ( !st ){
						res.status( 500 ).json( {
							success: false,
							message: 'The request to the database went wrong. Try later or contact us.'
						} );
						return;
					}
					new_order( newOrder, res );
					return;
				});
			} else {
				amount = product.amount - 1;
				db.products.updateOne_amount({"_id": id_product}, {"amount": amount}, function (err, st) {
					if(err){
						res.status( 500 ).json({
							success: false,
							message: 'The request to the database went wrong. Try later or contact us.'
						} ).send();
						return;
					}
					new_order( newOrder, res );
					return;
				});
			}
			return;
		}

	});

});

//get all order of an user
/*router.get( '', ( req, res ) => {

});
*/

/*router.get('/:id');
router.put();*/

// DELETE to delete an order of a specific user
router.delete( '/:id', ( req, res ) => {
	db.orders.deleteOne({
		"_id": req.params.id,
		"id_user": req.headers['user-id']
	}, function( err, data ){
		if( err ){
			res.status( 500 ).json({
				success: false,
				message: 'The request to the database went wrong. Try later or contact us.'
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
		res.status( 200 ).json( {message: "deleted order"} );
		return;
	});
});

module.exports = router;
