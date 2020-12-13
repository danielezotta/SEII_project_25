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
var token = jwt.sign({}, key, options);

var numCard = '1234';
var d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = '12/' + d;
var address = 'testAddress';
var amount = 1;
//----

describe('carts.test', () => {

    var connection;

    beforeAll(async() => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch(error => console.log(error));
        mongoose.set('useFindAndModify', false);

        console.log('Database connected!');
    });

    afterAll(async() => {
        await mongoose.connection.close(true);
        console.log('Database connection closed');
    })

    describe('POST /api/v1/carts/:id', () => {
        var usr; //user who create and dalete products
        var userId;
        var userId2;
        var productId;
        var productId2;
        var cartId;
        var cartId2;

        beforeAll(async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            usr = user.body._id;

            //creation user
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            userId = user.body._id;

            //creation user2
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            userId2 = user.body._id;

            //creation product
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            productId = product.body._id;

            //creation product 2
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            productId2 = product.body._id;
        });

        afterAll(async() => {
            await request(app).delete('/api/v1/products/'+productId2)
                .set('x-access-token', token)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+userId2)
                .set('x-access-token', token)
                .set('user-id', userId2);
            await request(app).delete('/api/v1/users/'+usr)
                .set('x-access-token', token)
                .set('user-id', usr);
        });

        //---success to add a product in the cart
        test('add product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            cartId = response.body._id;
            expect(response.status).toEqual(201);
        });
        //---

        //productId
        //---400 product id wrong format
        test('product id wrong format', async () => {
            let productId = 'wrong';
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });
            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'Product id bad format' });
        });
        //---
        //---400 product_id of a product sell by same user
        test( 'product_id of a product sell by same user', async () => {
            var response =  await request( app ).post( '/api/v1/carts/'+productId )
                                .set( 'x-access-token', token )
                                .set( 'user-id', usr )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    amount: amount
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product cannot be bought from the same seller' });
        });
        //---
        //---404  product_id not exists
        test('product id not exists', async () => {
            await request(app).delete('/api/v1/products/'+productId)
                .set('x-access-token', token)
                .set('user-id', usr);
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Product not found' });
        });
        //---

        //token
        //---400 token not provided
        test('token not provided', async () => {
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });
            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'No token provided' });
        });
        //---
        //---403 token not valid
        test('token not valid', async () => {
            let token = 'tokennonvalido';
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send();

            expect(response.status).toEqual(403);
            expect(response.body).toEqual({ success:false, message: 'Failed to authenticate token' });
        });
        //---

        //amount
        //---400 amount not provided
        test('amount not provided', async () => {
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send();

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---400 wrong amount
        test('amount wrong format', async () => {
            let amount = 'abcd';
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---400 negative amount
        test('amount negative number', async () => {
            let amount = -1234;
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---404 amount > products available
        test('amount > of available products', async () => {
            let amount = 1235;
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Product not available' });
        });
        //---
        //---404 amount > products available (with a cart already exists)
        test('amount > of available products (a cart already exists)', async () => {
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });
            let am = 1234;
            response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: am
                                });

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Product not available (this amount + amount in cart)' });
        });
        //---

        //user-id
        //---400 userId not provided
        test('userId not provided', async () => {
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', token)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'User id bad format' });
        });
        //---
        //---400 userId not string
        test('userId not string', async () => {
            let userId = 1234;
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'User id bad format' });
        });
        //---
        //---400 wrong userId format
        test('userId wrong format', async () => {
            let userId = 'wrong';
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount:amount
                                });

            expect(response.status).toEqual(400);
            expect(response.body).toEqual({ success:false, error: 'User id bad format' });
        });
        //---
        //---404 user does not exist
        test('userId not exists', async () => {
            await request(app).delete('/api/v1/carts/'+productId)
                .set('x-access-token', token)
                .set('user-id', userId);
            await request(app).delete('/api/v1/carts/'+productId2)
                .set('x-access-token', token)
                .set('user-id', userId);
            await request(app).delete('/api/v1/users/'+userId)
                .set('x-access-token', token)
                .set('user-id', userId);
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });
            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'User not found' });
        });
        //---

    });

    describe('POST /api/v1/carts', () => {
        var usr; //user who create and dalete products
        var userId;
        var user_no_carts;
        var user_up;
        var user_del;
        var productId;
        var productId2;
        var product_up;
        var product_del;

        beforeAll(async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            usr = user.body._id;

            //test success
            //creation user
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            userId = user.body._id;

            //creation product
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            productId = product.body._id;

            //creation product 2
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            productId2 = product.body._id;

            //insert productId in cart
            var cart =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            //insert productId2 in cart
            var cart =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            //test nothing in cart
            //creation user with nothing in cart
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            user_no_carts = user.body._id;

            //test update
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            user_up = user.body._id;

            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_up = product.body._id;

            var cart =  await request(app).post('/api/v1/carts/'+product_up)
                                .set('x-access-token', token)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: 1234
                                });

            await request(app).put('/api/v1/products/'+product_up)
                                .set('x-access-token', token)
                                .set('user-id', usr)
                                .send({
                                    name: 'producttest',
                                    image: 'testjpg',
                                    description: 'test',
                                    price: 1234,
                                    amount: 1
                                });

            //test delete
            var user = await request(app).post('/api/v1/users')
                .send({
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'test@test.it',
                    password: 'abcd'
                });
            user_del = user.body._id;

            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', token)
                .set('user-id', usr)
                .send({
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_del = product.body._id;

            var cart =  await request(app).post('/api/v1/carts/'+product_del)
                                .set('x-access-token', token)
                                .set('user-id', user_del)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: 1234
                                });

            var response = await request(app).put('/api/v1/products/'+product_del)
                                .set('x-access-token', token)
                                .set('user-id', usr)
                                .send({
                                    name: 'producttest',
                                    image: 'testjpg',
                                    description: 'test',
                                    price: 1234,
                                    amount: 0
                                });
        });

        afterAll(async() => {
            // test success
            await request(app).delete('/api/v1/products/'+productId)
                .set('x-access-token', token)
                .set('user-id', usr);
            await request(app).delete('/api/v1/products/'+productId2)
                .set('x-access-token', token)
                .set('user-id', usr);
            await request(app).delete('/api/v1/carts/'+productId)
                .set('x-access-token', token)
                .set('user-id', userId);
            await request(app).delete('/api/v1/carts/'+productId2)
                .set('x-access-token', token)
                .set('user-id', userId);
            await request(app).delete('/api/v1/users/'+userId)
                .set('x-access-token', token)
                .set('user-id', userId);
            // test no cart
            await request(app).delete('/api/v1/users/'+user_no_carts)
                .set('x-access-token', token)
                .set('user-id', user_no_carts);
            // test update
            await request(app).delete('/api/v1/products/'+product_up)
                .set('x-access-token', token)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+user_up)
                .set('x-access-token', token)
                .set('user-id', user_up);
            // test delete
            await request(app).delete('/api/v1/products/'+product_del)
                .set('x-access-token', token)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+user_del)
                .set('x-access-token', token)
                .set('user-id', user_del);
            await request(app).delete('/api/v1/users/'+usr)
                .set('x-access-token', token)
                .set('user-id', usr);
        });

        //success to buy all product in the cart
        test('buy all product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            let orders = response.body.orders;
            var i; var ord;
            for( i=0; i<orders.length; i++ ){
                ord = orders[i];
                await request(app).delete('/api/v1/orders/'+ord._id)
                                .set('x-access-token', token)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send();
            }
            expect(response.status).toEqual(201);
        });
        //---

        //404 nothing in cart
        test('nothing in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', user_no_carts)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Products not found in cart' });
        });

        //404-201 product in cart with amount > product current amount(!=0)
        test('update of product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            let orders = response.body.orders;
            var i; var ord;
            for( i=0; i<orders.length; i++ ){
                ord = orders[i];
                await request(app).delete('/api/v1/orders/'+ord._id)
                                .set('x-access-token', token)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send();
            }
            expect(response.status).toEqual(201);
        });

        //404-201 product in cart with amount > product current amount(=0)
        test('delete of product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', user_del)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', token)
                                .set('user-id', user_del)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
        });
    });

    // Get testing
    describe('GET /api/v1/carts/', () => {

        var userId;
        var token;

        beforeAll( async() => {

            // Create a new user for test
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_cart',
                    surname: 'surname_test_cart',
                    email: 'test_cart_get@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                })

            // Authenticate user for testing
            await request(app)
                .post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_cart_get@test.it",
                    password: "password"
                })
                .then(function(res) {
                    token = res.body.token;
            })

        });

        afterAll( async() => {
            await request(app)
                    .delete( '/api/v1/users/' + userId)
                    .set('Content-Type', 'application/json')
                    .set('x-access-token', token)
                    .set('user-id', userId)
        });

        // Test get cart
        it('Works with get cart', async() => {
            await request(app)
                .get(url)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(expect.any(Array));
                });
        });

        // Test get cart without login headers
        it('Works with get cart without headers', async() => {
            await request(app)
                .get(url)
                .set('Content-Type', 'application/json')
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with get cart without userId in headers', async() => {
            await request(app)
                .get(url)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with get cart without token in headers', async() => {
            await request(app)
                .get(url)
                .set('Content-Type', 'application/json')
                .set('user-id', userId)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with get cart with token not valid', async() => {
            await request(app)
                .get(url)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId)
                .expect(403);
        });

    });

    // Put testing
    describe('PUT /api/v1/carts/', () => {

        var productId = "";
        var userId = "";
        var token = "";
        var cartId = "";

        beforeAll( async() => {

            // Create a new user for test
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_cart',
                    surname: 'surname_test_cart',
                    email: 'test_cart_put@test.it',
                    password: 'password'
                })

            // Authenticate user for testing
            await request(app)
                .post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_cart_put@test.it",
                    password: "password"
                })
                .then(function(res) {
                    expect(200);
                    token = res.body.token;
                    userId = res.body.user_id;
            })

            // Create a new product for test
            await request(app)
                .post('/api/v1/products')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    name: 'name_test_cart',
                    image: 'image_test_cart',
                    description: 'description_test_cart',
                    price: 1,
                    amount: 15,
                    userId: userId
                })
                .then(function(res) {
                    productId = res.body._id;
            })

            //Add product to cart for test
            await request(app)
                .post('/api/v1/carts/')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    amount: 10,
                    userId: userId,
                    productId: productId
            })

        });

        afterAll( async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
            await request(app)
                .delete( '/api/v1/products/' + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
            await request(app)
                .delete( '/api/v1/users/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        });

        // Test get cart
        it('Works with put cart', async() => {
            await request(app)
                .put(url + "/" + productId)
                .send({
                    amount : 4
                })
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            "amount": 4,
                            "userId": userId,
                            "productId": productId
                        })
                    );
                });
        });

        // Test get cart without userid in headers
        it('Works with put cart amount not number', async() => {
            await request(app)
                .put(url + "/" + productId)
                .send({
                    amount: "string"
                })
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(400);
        });

        // Test get cart without userid in headers
        it('Works with put cart amount not defined', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(400);
        });

        // Test get cart without login headers
        it('Works with put cart without headers', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with put cart without userId', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with put cart without token', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('user-id', userId)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with put cart with token not valid', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId)
                .expect(403);
        });

        // Test get cart without userid in headers
        it('Works with put cart with wrongly formatted id', async() => {
            await request(app)
                .put(url + "/fakeproductid")
                .send({
                    amount: 4
                })
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(400);
        });

        // Test get cart without userid in headers
        it('Works with put cart with not existing product', async() => {
            await request(app)
                .put(url + "/1fb69e377cfaa8180c9a37aa")
                .send({
                    amount: 4
                })
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(404);
        });

    });

    // Delete testing
    describe('DELETE /api/v1/carts/', () => {

        var productId = "";
        var userId = "";
        var token = "";
        var cartId = "";

        beforeAll( async() => {

            // Create a new user for test
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_cart',
                    surname: 'surname_test_cart',
                    email: 'test_cart_delete@test.it',
                    password: 'password'
                })

            // Authenticate user for testing
            await request(app)
                .post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_cart_delete@test.it",
                    password: "password"
                })
                .then(function(res) {
                    expect(200);
                    token = res.body.token;
                    userId = res.body.user_id;
            })

            // Create a new product for test
            await request(app)
                .post('/api/v1/products')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    name: 'name_test_cart',
                    image: 'image_test_cart',
                    description: 'description_test_cart',
                    price: 1,
                    amount: 15,
                    userId: userId
                })
                .then(function(res) {
                    productId = res.body._id;
            })

            // Add product to cart for test
            await request(app)
                .post('/api/v1/carts/')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    amount: 5,
                    userId: userId,
                    productId: productId
            });

        });

        afterAll( async() => {
            await request(app)
                .delete( '/api/v1/products/' + productId)
                .set('x-access-token', token)
                .set('user-id', userId)
            await request(app)
                .delete( '/api/v1/users/' + userId)
                .set('x-access-token', token)
                .set('user-id', userId)
        });

        // Test get cart
        it('Works with delete cart item', async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            "userId": userId,
                            "productId": productId
                        })
                    );
                });
        });

        // Test get cart without login headers
        it('Works with delete cart item without headers', async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with delete cart item without userId', async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with delete cart item without token', async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('user-id', userId)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with delete cart item with token not valid', async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId)
                .expect(403);
        });

        // Test get cart without userid in headers
        it('Works with delete cart item with wrongly formatted id', async() => {
            await request(app)
                .delete(url + "/fakeproductid")
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(400);
        });

        // Test get cart without userid in headers
        it('Works with delete cart item with not existing product', async() => {
            await request(app)
                .delete(url + "/1fb69e377cfaa8180c9a37aa")
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(404);
        });
    });
});
