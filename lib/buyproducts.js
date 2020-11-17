const express = require('express');
const router = express.Router();
const db = require('./db.js');

//to control if 'app' must be the same of app.js
const app = express();

var jwt = require('jsonwebtoken');

//key to create token
var key = "passwordSuperSegretaPerGenerareIlToken";

//test autentication of user
router.use(function (req, res, next) {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.params.token || req.headers['x-access-token'];
	// decode token
	if (token) {
		jwt.verify(token, key, function (err, decoded) {
			if (err) {
				console.log("block invalid token");
				return res.status(400).json({ message: 'Failed to authenticate token.' });
			} else {
				console.log("access valid token");
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {
		//no token provided
		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}

});

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