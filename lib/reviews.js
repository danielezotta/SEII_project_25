const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Get all reviews for specific product
router.get('/:productId', (req, res) => {
    var reviews = db.reviews.findByProduct(req.params.productId, (err, data) => {
        // console.log(data);
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }
        if (data.length == 0) {
            res.status(404).json({
                "code": "404",
                "message": "No reviews for given product."
            });
            return;
        }
        res.status(200).json(data);
    });
});

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

// Add a review to the database
router.post('', (req, res) => {
    let newReview = {
        title: req.body.title,
        text: req.body.text,
        score: req.body.score,
        productId: req.body.productId,
        userId: req.body.userId
    };

    //Parameters control
    if (!newReview.title || typeof newReview.title != 'string') {
        res.status(400).json({code: "400", message: 'The field "title" must be a non-empty string, in string format' });
        return;
    }
    if (!newReview.text || typeof newReview.text != 'string') {
        res.status(400).json({code: "400", message: 'The field "text" must be a non-empty string, in string format' });
        return;
    }
    if (!newReview.score || typeof newReview.score != 'number' || newReview.score < 1 || newReview.score > 5) {
        res.status(400).json({code: "400", message: 'The field "score" must be non-empty and 1 < score < 5' });
        return;
    }
    var newReviewId = db.reviews.insert(newReview, function(err, data) {
        if(err){
          res.status(500).json({code: "500", message: "The request to the database gone wrong. Try later or contact us."});
          return;
        }
        data["self"] = "/api/v1/reviews/" + data["_id"];
        res.status(201).json(data);
    });

});

// DELETE to delete a specific review
router.delete( '/:id', ( req, res ) => {
	let review_id = req.params.id;
	if(  !review_id.match( /^[0-9a-fA-F]{24}$/ ) ){
		res.status( 400 ).json( {
			success: false,
			error: 'Review id bad format'
		} ).send();
        return;
	}
	db.reviews.deleteOne({
		'_id': req.params.id
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
				message: 'The review associated with _id was not found'
			}).send();
			return;
		}
		res.status( 200 ).json( {
			success:true, 
			message: 'review deleted'
		} ).send();
		return;
	});
});

module.exports = router;