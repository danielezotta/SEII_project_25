const request   = require('supertest');
const app       = require('./app.js');
const jwt       = require('jsonwebtoken')
const mongoose  = require('mongoose');
const Product   = require('../models/product.js');
const Review    = require('../models/review.js');
const User      = require('../models/user.js');
const { text } = require('express');

//correct data for test
var key = 'SE2_project_25';
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

describe( 'Tests reviews', () => {

    let connection;
    
    beforeAll( async() => {
        jest.setTimeout( 8000 );
        jest.unmock( 'mongoose' );
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        connection = await  mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch( error => console.log(error) );
        console.log( 'Database connected!' );
    });

    afterAll( async() => {
        await mongoose.connection.close( true );
        console.log( 'Database connection closed' );
    });

    //tests for CREATE, GET and DELETE for reviews
    describe( 'CREATE review, GET /api/v1/reviews/:product_id and DELETE /api/v1/reviews/:id', () => {
        var product_id;
        var user_id;
        var review1_id;

        beforeAll( async() => {
            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'asd'
                } );
            user_id = user.body._id;

            //create product
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: user_id
                } );
            product_id = product.body._id;
        });

        // Test creation with wrong title type
        test( 'works with post wrong title type', async() => {
            var response =  await request( app ).post( '/api/v1/reviews' )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .set( 'Content-Type', 'application/json' )
            .send( {
                productId: product_id,
                userId: user_id,
                title: 4,
                text: "text",
                score: 5
            } );
            review1_id = response.body._id;
            expect( response.status ).toEqual( 400 );
        })

        // Test creation with wrong text type
        test( 'works with post wrong text type', async() => {
            var response =  await request( app ).post( '/api/v1/reviews' )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .set( 'Content-Type', 'application/json' )
            .send( {
                productId: product_id,
                userId: user_id,
                title: "title",
                text: 2,
                score: 5
            } );
            review1_id = response.body._id;
            expect( response.status ).toEqual( 400 );
        })

        // Test creation with wrong score type
        test( 'works with post wrong score type', async() => {
            var response =  await request( app ).post( '/api/v1/reviews' )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .set( 'Content-Type', 'application/json' )
            .send( {
                productId: product_id,
                userId: user_id,
                title: "title",
                text: "text",
                score: "asdsf"
            } );
            review1_id = response.body._id;
            expect( response.status ).toEqual( 400 );
        })

        // Test creation with correct parameters
        test( 'works with post', async() => {
            var response =  await request( app ).post( '/api/v1/reviews' )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .set( 'Content-Type', 'application/json' )
            .send( {
                productId: product_id,
                userId: user_id,
                title: "title",
                text: "text",
                score: 5
            } );
            review1_id = response.body._id;
            expect( response.status ).toEqual( 201 );
        })

        // Test get list of reviews of product
        test( 'works with get', async() => {
            var response =  await request( app ).get( '/api/v1/reviews/' + product_id )
            .send();
            expect( response.status ).toEqual( 200 );
        })

        // Test delete existing review
        test( 'works with delete', async() => {
            var response =  await request( app ).delete( '/api/v1/reviews/' + review1_id )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .send();
            expect( response.status ).toEqual( 200 );
        })

        // Test delete non-existing review
        test( 'works with delete non existing', async() => {
            var response =  await request( app ).delete( '/api/v1/reviews/' + review1_id )
            .set( 'x-access-token', token )
            .set( 'user-id', user_id )
            .send();
            expect( response.status ).toEqual( 404 );
        })

        // Test get list of reviews of product with no reviews
        test( 'works with get no reviews', async() => {
            var response =  await request( app ).get( '/api/v1/reviews/' + product_id )
            .send();
            expect( response.status ).toEqual( 200 );
        })
    })
})