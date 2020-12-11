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
                if (!data) {
                    res.status(404).send({
            			success: false,
            			message: 'The user-id header can not be found.'
            		});
                    return;
                } else {
                    jwt.verify(token, 'SE2_project_25', function(err, decoded) {
                        if (err) {
                            res.status(403).json({
                                success: false,
                                message: 'Failed to authenticate token.'
                            });
                            return;
                        } else if (decoded.user !== userId) {
							res.status(403).json({
                                success: false,
                                message: 'The token was not associated for this user-id.'
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
    			success: false,
    			message: 'The user-id header is badly formatted.'
    		});
        }
	} else {
		return res.status(401).send({
			success: false,
			message: 'No token provided.'
		});
	}
});

module.exports = router;
