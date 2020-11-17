const express = require('express');
const router = express.Router();
const db = require('./db.js');

var jwt = require('jsonwebtoken');
//key to create token
var key = "passwordSuperSegretaPerGenerareIlToken";

//--- test autentication of user
//IMPORTANTE: in this case, the user can send id of other user with his token
//it causes securety leak
router.use(function (req, res, next) {
	// check url parameters or post parameters for token and id_user
	var token = req.body.token || req.params.token;
	var id_user = req.body.id_user || req.params.id_user;

	// decode token
	if (token && id_user) {
		jwt.verify(token, key, function (err, decoded) {
			if (err) {
				console.log("ACCESS: block invalid token");
				return res.status(403).json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				var user = db.users.findOne({ "_id": id_user }, function (user) {
					if (!user) {
						return res.status(403).json({ success: false, message: 'User not found.' });
					} else if (user) {
						console.log('ACCESS: valid token for: id: ' + id_user + '; email: ' + user.email);
					}
				});

				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {
		let msg = {};
		msg.success = false;

		if (!token) {
			msg.token = 'No token provided';
		}
		if (!id_user) {
			msg.id_user = 'No id_user provided';
		}

		return res.status(403).send(msg);
	}

});
//---



// put the confirm of bought of product identified by _id in req.body
router.put('', (req, res) => { 
    /*let id_product = req.body._id;

    if (!id_product || typeof id_product != 'string') {
        res.status(400).json({ error: 'The field "_id" must be a non-empty string, in string format' });
        return;
    }
	var product = db.products.findOne(req.params.id, function (data) {
		console.log("comprato prodotto");
		res.status(200).json(data);
	});*/
	console.log("aquistato prodotto");
	res.status(200).json({ message: 'Acquistato prodotto' });
	return;
});

module.exports = router;