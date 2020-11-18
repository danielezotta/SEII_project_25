const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());

//to edit
app.use('/', express.static('static'));

// Modules for API requests
const order = require('./buyproducts.js');
//TO DELETE: temp login to test api
const temp_login = require('./login.js');
app.use('/api/v1/login', temp_login);
//---

app.use('/api/v1/order', order);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;
