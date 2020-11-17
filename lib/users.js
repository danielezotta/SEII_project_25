const express = require('express');
const router = express.Router();
const db = require('./db.js');

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
        delete data["_id"];
        res.status(201).json(data);

    });

});

router.get('/:id', (req, res) => {

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

        data["self"] = "/api/v1/users/" + data["_id"];
        delete data["_id"];
        res.status(200).json(data);

    });

});

module.exports = router;
