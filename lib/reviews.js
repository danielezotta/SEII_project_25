const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Get all reviews for specific product
router.get('/:id', (req, res) => {
    var reviews = db.reviews.find(req.params.productId, (err, data) => {
        // console.log(data);
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database went wrong. Try later or contact us."
            });
            return;
        }
        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "No reviews for given product."
            });
            return;
        }
        res.status(200).json(data);
    });
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
    if (!newReview.score) {
        res.status(400).json({code: "400", message: 'The field "score" must be non-empty' });
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