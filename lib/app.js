const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/', express.static('static'));

// Modules for API requests
const users = require('./users.js');
const products = require('./products.js');
const orders = require('./orders.js');
const carts = require('./carts.js');
const reviews = require('./reviews.js');

app.use('/api/v1/products', products);
app.use('/api/v1/users', users);
app.use('/api/v1/orders', orders);
app.use('/api/v1/carts', carts);
app.use('/api/v1/reviews', reviews);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});

module.exports = app;
