const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//to edit
app.use('/', express.static('static'));

// Modules for API requests
const users = require('./users.js');
const products = require('./products.js');
const order = require('./orders.js');
app.use('/api/v1/products', products);
app.use('/api/v1/users', users);
app.use('/api/v1/orders', order);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;
