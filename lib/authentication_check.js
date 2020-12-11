const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Authentication check
router.use(function(req, res, next) {
	var token = req.headers['x-access-token'];
    var userId = req.headers['user-id'];

	if (token && userId) {
        if (userId.match(/^[0-9a-fA-F]{24}$/)) {
            db.users.findOne({"_id": userId}, (err, data) => {
				if (err) {
		            res.status(500).json({
		                "code": "500",
		                "message": "The request to the database gone wrong. Try later or contact us."
		            });
		            return;
		        }
                if (!data) {
                    res.status(404).send({
            			"code": "404",
            			"message": 'The user-id header can not be found.'
            		});
                    return;
                } else {
                    jwt.verify(token, 'SE2_project_25', function(err, decoded) {
                        if (err) {
                            res.status(403).json({
		            			"code": "403",
                                "message": 'Failed to authenticate token.'
                            });
                            return;
                        } else if (decoded.userId !== userId) {
							res.status(403).json({
		            			"code": "403",
                                "message": 'The token is not associated with this user-id.'
                            });
                            return;
                        } else {
                            next();
                        }
                    });
                }
            })
        } else {
            return res.status(400).send({
				"code": "400",
    			"message": 'The user-id header is badly formatted.'
    		});
        }
	} else {
		return res.status(401).send({
			"code": "401",
			"message": 'No token provided.'
		});
	}
});

module.exports = router;
