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

// POST all product in the cart

module.exports = router;
