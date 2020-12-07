const request  = require('supertest');
const app      = require('./app.js');
const jwt      = require('jsonwebtoken')
const mongoose = require('mongoose');
const Product = require('../models/product.js');
const Order = require('../models/order.js');
const User = require('../models/user.js');
const Cart = require('../models/cart.js');

//correct data for test
var key = 'SE2_project_25';
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

var amount = 1;
//----

describe( 'tests carts', () => {

    var connection;
    
    beforeAll( async() => {
        jest.setTimeout( 8000 );
        jest.unmock( 'mongoose' );
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch(error => console.log(error));
        mongoose.set('useFindAndModify', false);

        console.log( 'Database connected!' );
    });

    afterAll( async() => {
        await mongoose.connection.close( true );
        console.log( 'Database connection closed' );
    })

    describe( 'POST /api/v1/orders/:id', () => {
        var productId;
        var userId;

        beforeAll( async() => {

            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            userId = user.body._id;

            //creation product with amount >1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', token )
                .set( 'user-id', userId )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: userId
                });
            productId = product.body._id;
        });

        afterAll( async () => {
            await request( app ).delete( '/api/v1/products/'+productId )
                .set( 'x-access-token', token )
                .set( 'user-id', userId );
            await request( app ).delete( '/api/v1/users/'+userId )
                .set('x-access-token', token )
                .set( 'user-id', userId );
        });

        //---add item in db
        test( 'add item in cart', async() => {
            var response =  await request( app ).post( '/api/v1/carts/'+productId )
                                .set( 'x-access-token', token )
                                .set( 'user-id', userId )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    amount: amount
                                });

            console.log(response.body);
            expect( response.status ).toEqual( 201 );
        });
        //---
    });
    
});
