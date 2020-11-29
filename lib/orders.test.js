const request  = require('supertest');
const app      = require('./app.js');
const jwt      = require('jsonwebtoken')
const mongoose = require('mongoose');
const Product = require('../models/product.js');
const Order = require('../models/order.js');
const User = require('../models/user.js');

//correct data for test
var key = 'SE2_project_25';
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

var d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = '12/' + d;
var address = 'testAddress';
var numCard = '1234';
//----

describe( 'tests order', () => {

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
    })

    //tests for DELETE of an orders
    describe( 'DELETE /api/v1/orders/:id', () => {
        var product_id;
        var user_id;
        var ord1_id;
        var ord2_id;

        beforeAll( async() => {
            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                } );
            user_id = user.body._id;

            //creation product with amount >1
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

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord1_id = ord.body._id;

            //creation order 2
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord2_id = ord.body._id;
        });

        //---success to delete an orders
        test( 'delete order', async() => {
            var response =  await request( app ).delete( '/api/v1/orders/'+ord1_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 200 );
        } );
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).delete( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' } );
        } );
        //---
        //---404  product_id not exists
        test( 'product_id not exists', async () => {    
            var response =  await request( app ).delete( '/api/v1/orders/'+ord1_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' } );
        });
        //---

        //token
        //---400 token not provided
        test( 'token not provided', async () => {
            var response =  await request( app ).delete( '/api/v1/orders/'+ord2_id )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'No token or id_user provided' } );
        });
        //---
        //---403 token not valid
        test( 'token not valid', async () => {
            let token = 'tokennonvalido';
            var response =  await request( app ).delete( '/api/v1/orders/'+ord2_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 403 );
            expect( response.body ).toEqual( { success:false, message: 'Failed to authenticate token' } );
        } );
        //---

        //user-id
        //---400 user_id not provided
        test( 'user_id not provided', async () => {
            var response =  await request( app ).delete( '/api/v1/orders/'+ord2_id )
                                .set( 'x-access-token', token )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'No token or id_user provided' } );
        } );
        //---
        //---400 user_id not string
        test( 'user_id not string', async () => {
            let user_id = 1234;
            var response =  await request( app ).delete( '/api/v1/orders/'+ord2_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'User id bad format' } );
        } );
        //---
        //---400 wrong user_id format
        test( 'user_id wrong format', async () => {
            let user_id = 'wrong';
            var response =  await request( app ).get( '/api/v1/orders/'+ord2_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'User id bad format' } );
        } );
        //---
        //---404 user does not exist
        test( 'user_id not exists', async () => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/orders/'+ord2_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', token )
                .set( 'user-id', user_id );
            var response =  await request( app ).delete( '/api/v1/orders/'+ord2_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );
            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, error: 'User not found' } );
        });
        //---
    } );
 
    //avoid all test of user_id and token in next tests
    //user_id and token managed by the same function in all API for orders

    //tests for GET of all orders
    describe( 'GET /api/v1/orders', () => {
        var product_id;
        var user_id;
        var ord1_id;
        var ord2_id;

        beforeAll( async() => {

            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                } );
            user_id = user.body._id;

            //creation product with amount >1
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

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord1_id = ord.body._id;

            //creation order 2
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord2_id = ord.body._id;
        });

        afterAll( async () => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/orders/'+ord1_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/orders/'+ord2_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', token )
                .set( 'user-id', user_id );
        });

        //---success to get all orders
        test( 'all orders of id user', async() => {
            var response =  await request( app ).get( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 200 );
        } );
        //---
    } );

    //tests for GET of an orders
    describe( 'GET /api/v1/orders/:id', () => {
        var product_id;
        var user_id;
        var ord_id;

        beforeAll( async() => {
            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                } );
            user_id = user.body._id;

            //creation product with amount >1
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

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord_id = ord.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', token )
                .set( 'user-id', user_id );
        } );

        //---success to get an orders
        test( 'get specific order', async() => {
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( );
            expect( response.status ).toEqual( 200 );
        } );
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' } );
        } );
        //---
        //---404  product_id not exists
        test( 'order id not exists', async () => {   
            await request( app ).delete( '/api/v1/orders/'+ord_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id ); 
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' } );
        });
        //---
    } );

    //tests for PUT of an orders
    describe( 'PUT /api/v1/orders/:id', () => {
        var product_id;
        var user_id;
        var ord_id;

        beforeAll( async() => {
            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                } );
            user_id = user.body._id;

            //creation product with amount >1
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

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );
            ord_id = ord.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', token )
                .set( 'user-id', user_id );
        } );

        var new_address = "newTestAddress";
        //---success to modify an orders
        test( 'put specific order', async() => {
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    address : new_address 
                                } );
            expect( response.status ).toEqual( 200 );
        } );
        //---

        //address
        //---400 address not provided
        test( 'address not provided', async () => {
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send(  )
            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' } );
        } );
        //---
        //---400 wrong address
        test( 'address wrong format', async () => {
            let new_address = '';
            var response =  await request(app).put('/api/v1/orders/'+ord_id)
                                .set('x-access-token', token)
                                .set('user-id', user_id)
                                .set('Accept', 'application/json')
                                .send({
                                    address: new_address
                                });
            expect(response.status).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' } );
        });
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    address : new_address 
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' } );
        } );
        //---
        //---404  product_id not exists
        test( 'order id not exists', async () => {   
            await request( app ).delete( '/api/v1/orders/'+ord_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id ); 
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    address : new_address 
                                } );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' } );
        });
        //---
    } );

    //tests for POST and control of authentication
    describe( 'POST /api/v1/orders', () => {
        var product_id;
        var product_id_amount_1; //to test amount == 1
        var user_id;

        beforeAll( async() => {
            //creation of an user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                } );
            user_id = user.body._id;

            //creation product with amount >1
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

            //creation product with amount =1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1,
                    userId: user_id
                } );
            product_id_amount_1 = product.body._id;
        } );

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', token )
                .set( 'user-id', user_id );
        });

        //---success with amount > 1 => update
        test( 'works with post, amount > 1', async() => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            let ord1_id = response.body._id;
            await request( app ).delete( '/api/v1/orders/'+ord1_id )
                .set( 'x-access-token', token )
                .set( 'user-id', user_id );
            expect( response.status ).toEqual( 201 );
        } );
        //---

        //---success with amount == 1 => delete
        test( 'works with post, amount == 1', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id_amount_1,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            let ord2_id = response.body._id;
            await request( app ).delete( '/api/v1/orders/'+ord2_id )
                .set( 'x-access-token', token )
                .set( 'user-id',user_id );
            expect( response.status ).toEqual( 201 );
        } );
        //---

        //product_id
        //---400  product_id not provided
        test( 'product_id not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' } );
        } );
        //---
        //---400  product_id not string
        test( 'product_id not string', async () => {
            let product_id = 1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' } );
        } );
        //---
        //---400 product_id wrong format
        test( 'product_id wrong format', async () => {
            let product_id = 'wrong';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' } );
        } );
        //---
        //---404  product_id not exists
        test( 'product_id not exists', async () => {    
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id_amount_1,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'Product not found' } );
        });
        //---
        
        //address
        //---400 address not provided
        test( 'address not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' } );
        } );
        //---
        //---400 wrong address
        test( 'address wrong format', async () => {
            let address = '';
            var response =  await request(app).post('/api/v1/orders')
                                .set('x-access-token', token)
                                .set('user-id', user_id)
                                .set('Accept', 'application/json')
                                .send({
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(400);
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' } );
        });
        //---

        //numCard
        //---400 numCard not provided
        test( 'numCard not provided', async () => {
            var response =  await request(app).post('/api/v1/orders')
                                .set('x-access-token', token)
                                .set('user-id', user_id)
                                .set('Accept', 'application/json')
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' } );
        });
        //---
        //---400 wrong numCard
        test( 'numCard wrong format', async () => {
            let numCard = 'abcd';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' } );
        });
        //---
        //---400 negative numCard
        test( 'numCard negative number', async () => {
            let numCard = -1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' } );
        });
        //---

        //expCard
        //---400 expCard not provided
        test( 'expCard not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' } );
        });
        //---
        //---400 wrong expCard
        test( 'expCard wrong format(MM/YYYY/NNNN)', async () => {
            let expCard = '12/2020/1234';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' } );
        });
        //---
        //---400 expCard not a string
        test( 'expCard not a string', async () => {
            let expCard = 1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' } );
        });
        //---
        //---400 expCard without '/'
        test( 'expCard without /', async () => {
            let expCard = '12/2020/1234';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' } );
        });
        //---
        //---400 expCard year length != 4
        test( 'expCard with year lenght != 4', async () => {
            let expCard = '12/202';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' } );
        });
        //---
        //---400 expCard negative year 
        test( 'expCard with negative year', async () => {
            let expCard = '12/-123';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' } );
        });
        //---
        //---400 expCard with year < current year
        test( 'expCard with year < current year', async () => {
            let expCard = '12/2019';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' } );
        });
        //---
        //---400 expCard with month > 12 
        test( 'expCard with month > 12', async () => {
            let expCard = '120/' + d;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' } );
        });
        //---
        //---400 expCard with month < current month 
        test( 'expCard with month < current month', async () => {
            let expCard = '01/' + (parseInt(d)-1);
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' } );
        });
        //---
        //---400 expCard with negative month  
        test( 'expCard with negative month', async () => {
            let expCard = '-1/' + d;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', token )
                                .set( 'user-id', user_id )
                                .set( 'Accept', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                } );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' } );
        });
        //---
    });
    
} );
