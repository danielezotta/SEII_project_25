const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use('/', express.static('static'));

// Modules for API requests
const buy_products = require('./buyproducts.js');
//TO DELETE: temp login to test api
const temp_login = require('./login.js');
app.use('/api/v1/login', temp_login);
//---

app.use('/api/v1/buyproduct', buy_products);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;
