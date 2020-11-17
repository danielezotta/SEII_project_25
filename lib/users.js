const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');

// Post request to create a user
router.post('', (req, res) => {

    // Init the user with the request body vars
    let newUser = {
        name: req.body.name,
        surname: req.body.surname,
        email: req.body.email,
        password: req.body.password
    }

    // Check if all the fields are valid, otherwise error 400
    if (!newUser.name || typeof newUser.name != 'string') {
        res.status(400).json({
            "code": "400",
            "message": "The field name is not valid, please correct and retry."
        });
        return;
    }

    if (!newUser.surname || typeof newUser.surname != 'string') {
        res.status(400).json({
            "code": "400",
            "message": "The field surname is not valid, please correct and retry."
        });
        return;
    }

    if (!newUser.email || typeof newUser.email != 'string' || !(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(newUser.email))) {
        res.status(400).json({
            "code": "400",
            "message": "The field email is not valid, please correct and retry."
        });
        return;
    }

    if (!newUser.password || typeof newUser.password != 'string') {
        res.status(400).json({
            "code": "400",
            "message": "The field password is not valid, please correct and retry."
        });
        return;
    }

    // Insert the user to the db, if error, 500 response
    db.users.insert(newUser, (err, data) => {

        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }

        data["self"] = "/api/v1/users/" + data["_id"];
        res.status(201).json(data);

    });

});

// Get request for infos about user
router.get('/:id', (req, res) => {

    // Get the user info from db, 500 if db error, 404 if user not found
    db.users.findOne({"_id": req.params.id}, (err, data) => {
        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }

        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The user can't be found."
            });
            return;
        }

        var user = {
            self: `/api/v1/users/${data._id}`,
            name: data.name
        };
        res.status(200).json(user);

    });

});

// User login, response contains token
router.post('/login', (req, res) => {

    // Search for user by email in db, 500 if db error, 404 if user not found, 400 if wrong password
    db.users.findOne({"email" : req.body.email}, (err, user) => {

        if (err) {

            res.status(500).json({
              "code": "500",
              "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;

        }

        if (!user) {

			res.status(404).json({
              "code": "404",
              "message": "The user can not be found."
            });

		} else if (user) {

			// check if password matches
			if (user.password != req.body.password) {

				res.status(400).json({
                  "code": "400",
                  "message": "The password does not match."
                });

			} else {

				const options = {
					expiresIn: 43200
				}

				const token = jwt.sign({user: user._id, email: user.email}, 'SE2_project_25', options);

				res.status(200).json({
					"message": 'Token generated successfully!',
					"token": token
				});
			}

		}
    });

});

// Authentication check
router.use(function(req, res, next) {

	var token = req.body.token || req.params.token || req.headers['x-access-token'];

	if (token) {

		jwt.verify(token, 'SE2_project_25', function(err, decoded) {
			if (err) {
				res.status(401).json({
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

		return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});

	}
});

// Edit user infos
router.put('/:id', (req, res) => {

    var userUpdate = {};

    // Check for existence of field and validity, code 400 for error
    if (req.body.name && typeof req.body.name == 'string') {
        userUpdate.name = req.body.name;
    } else if (req.body.name) {
        res.status(400).json({
            "code": "400",
            "message": "The field name is not valid, please correct and retry."
        });
    }

    if (req.body.surname && typeof req.body.surname == 'string') {
        userUpdate.surname = req.body.surname;
    } else if (req.body.surname) {
        res.status(400).json({
            "code": "400",
            "message": "The field surname is not valid, please correct and retry."
        });
    }

    if (req.body.email && typeof req.body.email == 'string' && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email))) {
        userUpdate.email = req.body.email;
    } else if (req.body.email) {
        res.status(400).json({
            "code": "400",
            "message": "The field email is not valid, please correct and retry."
        });
    }

    if (req.body.password && typeof req.body.password == 'string') {
        userUpdate.password = req.body.password;
    } else if (req.body.password) {
        res.status(400).json({
            "code": "400",
            "message": "The field password is not valid, please correct and retry."
        });
    }

    // Search and update the user if founded, 500 for db error, 404 for user not found
    db.users.findOneAndUpdate({"_id": req.params.id}, {$set:userUpdate}, (err, data) => {

        if (err) {
            res.status(500).json({
                "code": "500",
                "message": "The request to the database gone wrong. Try later or contact us."
            });
            return;
        }

        if (!data) {
            res.status(404).json({
                "code": "404",
                "message": "The user can't be found."
            });
            return;
        }

        var user = {
            self: `/api/v1/users/${data._id}`,
            name: data.name
        };
        res.status(201).json(user);

    });

});


module.exports = router;
