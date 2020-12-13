const express = require('express');
const router = express.Router();
const db = require('./db.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

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

    // Hash the password so it's not saved clearly
    bcrypt.hash(newUser.password, 8, function(err, hash) {
        newUser.password = hash;

        // Insert the user to the db, if error 500 response
        db.users.insert(newUser, (err, data) => {
            if (err) {
                res.status(500).json({
                    "code": "500",
                    "message": "The request to the database gone wrong. Try later or contact us."
                });
                return;
            }

            res.status(201).json(data);
        });
    })

});

// Get request for infos about user
router.get('/:id', (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The user id is badly formatted."
        });
        return;
    }

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

        // Check if user is logged, so are added private fields (like for edit)
        var userId = req.headers['user-id'];
        var token = req.headers['x-access-token'];
        if ((userId == req.params.id) && token) {
            jwt.verify(token, 'SE2_project_25', function(err, decoded) {
    			if (!err && decoded.userId === userId) {
                    user.surname = data.surname,
                    user.email = data.email,
                    user.password = data.password
    			}
    		});

        }
        res.status(200).json(user);
    });
});

// User login, response contains token
router.post('/login', (req, res) => {

    if (!req.body.email || typeof req.body.email != 'string') {
        res.status(400).json({
          "code": "400",
          "message": "The field 'email' is not valid."
        });
        return;
    }

    if (!req.body.password || typeof req.body.password != 'string') {
        res.status(400).json({
          "code": "400",
          "message": "The field 'password' is not valid."
        });
        return;
    }

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
            bcrypt.compare(req.body.password, user.password, function(err, success) {
                if(success) {
                    const options = {
                        expiresIn: 43200
                    }

                    const token = jwt.sign({userId: user._id, email: user.email}, 'SE2_project_25', options);

                    res.status(200).json({
                        "message": 'Token generated successfully!',
                        "user_id": user._id,
                        "token": token
                    });
                } else {
                    res.status(400).json({
                      "code": "400",
                      "message": "The password does not match."
                    });
                    return;
                }
            });
		}
    });
});

// Authentication check
router.use('', require('./authentication_check.js'));

// Edit user infos
router.put('/:id', (req, res) => {

    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The user id is badly formatted."
        });
        return;
    }

    if (req.params.id != req.headers['user-id']) {
        res.status(403).send({
            "code": "403",
            "message": "User not corresponding."
        });
        return;
    }

    var userUpdate = {};

    // Check for existence of field and validity, code 400 for error
    if (req.body.name && typeof req.body.name == 'string') {
        userUpdate.name = req.body.name;
    } else if (req.body.name) {
        res.status(400).json({
            "code": "400",
            "message": "The field name is not valid, please correct and retry."
        });
        return;
    }

    if (req.body.surname && typeof req.body.surname == 'string') {
        userUpdate.surname = req.body.surname;
    } else if (req.body.surname) {
        res.status(400).json({
            "code": "400",
            "message": "The field surname is not valid, please correct and retry."
        });
        return;
    }

    if (req.body.email && typeof req.body.email == 'string' && (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(req.body.email))) {
        userUpdate.email = req.body.email;
    } else if (req.body.email) {
        res.status(400).json({
            "code": "400",
            "message": "The field email is not valid, please correct and retry."
        });
        return;
    }

    if (req.body.password && typeof req.body.password == 'string') {
        userUpdate.password = req.body.password;
        // Hash the password for some added security
        bcrypt.hash(userUpdate.password, 16, function(err, hash) {
            userUpdate.password = hash;
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
                return;
            });
        });
    } else if (req.body.password) {
        res.status(400).json({
            "code": "400",
            "message": "The field password is not valid, please correct and retry."
        });
        return;
    } else {
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
    }
});

router.delete('/:id', (req, res) => {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
        res.status(400).json({
            "code": "400",
            "message": "The user id is badly formatted."
        });
        return;
    }

    if (req.params.id != req.headers['user-id']) {
        res.status(403).send({
			success: false,
			message: 'User not corresponding.'
		});
        return;
    }

    // Search and update the user if founded, 500 for db error, 404 for user not found
    db.users.deleteOne({"_id": req.params.id}, (err, data) => {
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
            self: `/api/v1/users/${req.params.id}`
        };
        res.status(200).json(user);
    });
});

module.exports = router;
