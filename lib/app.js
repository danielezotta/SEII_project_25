const express = require('express');
const app = express();

app.use(express.json());
app.use(express.urlencoded());

app.use('/', express.static('static'));


// Modules for API requests
const users = require('./users.js');

app.use('/api/v1/users', users);

/* Default 404 handler */
app.use((req, res) => {
    res.status(404);
    res.json({ error: 'Not found' });
});


module.exports = app;
