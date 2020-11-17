const express = require('express');
const router = express.Router();

var jwt = require('jsonwebtoken');
var key = "passwordSuperSegretaPerGenerareIlToken";

router.get('', (req, res) => {
    var token = jwt.sign({}, key, options);
    var options = {
        expiresIn: 86400 // expires in 24 hours
    }

    res.status(200).json({ message: 'token to login', token: token });
});

module.exports = router;
