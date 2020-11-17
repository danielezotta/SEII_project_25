const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use('/', express.static('static'));


// Modules for API requests
const sellProducts = require('./sellProducts.js');
app.use('/api/v1/products', sellProducts);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
