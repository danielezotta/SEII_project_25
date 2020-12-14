const request  = require('supertest');
const app      = require('./app.js');
const mongoose = require('mongoose');

//correct data for test
var url = "/api/v1/carts";

var numCard = '1234';
var d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = '12/' + d;
var address = 'testAddress';
var amount = 1;
//----

describe('carts.test', () => {

    beforeAll(async() => {
        jest.setTimeout(8000);
        jest.unmock('mongoose');
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch(error => console.log(error));
        mongoose.set('useFindAndModify', false);
    });

    afterAll(async() => {
        await mongoose.connection.close(true);
    })

    describe('POST /api/v1/carts/:id', () => {
        var usr; //user who create and dalete products
        var t_usr; //token
        var userId;
        var t_userId; //token
        var productId;
        var productId2;

        beforeAll(async() => {
            //creation user who create and delete products
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'usr@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    usr = res.body._id;
                });

            // Authenticate user for testing
            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "usr@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_usr = res.body.token;
                });

            //creation user
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'userId@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "userId@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_userId = res.body.token;
                });

            //creation product
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', t_usr)
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
                .set('x-access-token', t_usr)
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
            await request(app).delete('/api/v1/carts/'+productId2)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            await request(app).delete('/api/v1/products/'+productId2)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+userId)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            await request(app).delete('/api/v1/users/'+usr)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
        });

        //---success to add a product in the cart
        test('add product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', t_userId)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            await request(app).delete('/api/v1/carts/'+productId)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            cartId = response.body._id;
            expect(response.status).toEqual(201);
        });
        //---

        //productId
        //---400 product id wrong format
        test('product id wrong format', async () => {
            let productId = 'wrong';
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', t_userId)
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
                                .set( 'x-access-token', t_usr )
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
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            var response =  await request(app).post('/api/v1/carts/'+productId)
                                .set('x-access-token', t_userId)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Product not found' });
        });
        //---

        //amount
        //---400 amount not provided
        test('amount not provided', async () => {
            var response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_userId)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: amount
                                });
            let am = 1234;
            response =  await request(app).post('/api/v1/carts/'+productId2)
                                .set('x-access-token', t_userId)
                                .set('user-id', userId)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: am
                                });

            expect(response.status).toEqual(404);
            expect(response.body).toEqual({ success:false, message: 'Product not available (this amount + amount in cart)' });
        });
        //---

    });

    describe('POST /api/v1/carts', () => {
        var usr; //user who create and dalete products
        var t_usr;
        var userId;
        var t_userId;
        var user_no_carts;
        var t_user_no_carts;
        var user_up;
        var t_user_up;
        var user_del;
        var t_user_del;
        var productId;
        var productId2;
        var product_up;
        var product_del;

        beforeAll(async() => {
            //creation user who create and dalete products
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'usr@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    usr = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "usr@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_usr = res.body.token;
                });

            //test success
            //creation user
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'userId@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "userId@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_userId = res.body.token;
                });

            //creation product
            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', t_usr)
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
                .set('x-access-token', t_usr)
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
            await request(app).post('/api/v1/carts/'+productId)
                .set('x-access-token', t_userId)
                .set('user-id', userId)
                .set('Content-Type', 'application/json')
                .send({
                    amount: 10
                });

            //insert productId2 in cart
            await request(app).post('/api/v1/carts/'+productId2)
                .set('x-access-token', t_userId)
                .set('user-id', userId)
                .set('Content-Type', 'application/json')
                .send({
                    amount: 11
                });

            //test nothing in cart
            //creation user with nothing in cart
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'user_no_carts@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    user_no_carts = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "user_no_carts@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_user_no_carts = res.body.token;
                });

            //test update
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'user_up@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    user_up = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "user_up@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_user_up = res.body.token;
                });

            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', t_usr)
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
                                .set('x-access-token', t_user_up)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send({
                                    amount: 1234
                                });

            await request(app).put('/api/v1/products/'+product_up)
                                .set('x-access-token', t_usr)
                                .set('user-id', usr)
                                .send({
                                    name: 'producttest',
                                    image: 'testjpg',
                                    description: 'test',
                                    price: 1234,
                                    amount: 1
                                });

            //test delete
            await request(app).post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test',
                    surname: 'surname_test',
                    email: 'user_del@testCartPost.it',
                    password: 'password'
                })
                .then(function(res) {
                    user_del = res.body._id;
                });

            await request(app).post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "user_del@testCartPost.it",
                    password: "password"
                })
                .then(function(res) {
                    t_user_del = res.body.token;
                });

            var product = await request(app).post('/api/v1/products')
                .set('x-access-token', t_usr)
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

            await request(app).post('/api/v1/carts/'+product_del)
                .set('x-access-token', t_user_del)
                .set('user-id', user_del)
                .set('Content-Type', 'application/json')
                .send({
                    amount: 1234
                });

            await request(app).put('/api/v1/products/'+product_del)
                .set('x-access-token', t_usr)
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
            await request(app).delete('/api/v1/carts/'+productId)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            await request(app).delete('/api/v1/carts/'+productId2)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            await request(app).delete('/api/v1/products/'+productId)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            await request(app).delete('/api/v1/products/'+productId2)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+userId)
                .set('x-access-token', t_userId)
                .set('user-id', userId);
            // test no cart
            await request(app).delete('/api/v1/users/'+user_no_carts)
                .set('x-access-token', t_user_no_carts)
                .set('user-id', user_no_carts);
            // test update
            var res = await request(app).delete('/api/v1/carts/'+product_up)
                .set('x-access-token', t_user_up)
                .set('user-id', user_up);
            await request(app).delete('/api/v1/products/'+product_up)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+user_up)
                .set('x-access-token', t_user_up)
                .set('user-id', user_up);
            // test delete
            await request(app).delete('/api/v1/products/'+product_del)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
            await request(app).delete('/api/v1/users/'+user_del)
                .set('x-access-token', t_user_del)
                .set('user-id', user_del);
            await request(app).delete('/api/v1/users/'+usr)
                .set('x-access-token', t_usr)
                .set('user-id', usr);
        });

        //success to buy all product in the cart
        test('buy all product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_userId)
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
                                .set('x-access-token', t_user_no_carts)
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
                                .set('x-access-token', t_user_up)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', t_user_up)
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
                                .set('x-access-token', t_user_up)
                                .set('user-id', user_up)
                                .set('Content-Type', 'application/json')
                                .send();
            }
            expect(response.status).toEqual(201);
        });

        //404-201 product in cart with amount > product current amount(=0)
        test('delete of product in cart', async() => {
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', t_user_del)
                                .set('user-id', user_del)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(404);
            var response =  await request(app).post('/api/v1/carts')
                                .set('x-access-token', t_user_del)
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
        var userId1 = "";
        var userId2 = "";
        var token1 = "";
        var token2 = "";
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
                    token1 = res.body.token;
                    userId1 = res.body.user_id;
            })

            // Create a new user for product
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_cart',
                    surname: 'surname_test_cart',
                    email: 'test_cart_put_product@test.it',
                    password: 'password'
            })

            // Authenticate user for product
            await request(app)
                .post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_cart_put_product@test.it",
                    password: "password"
                })
                .then(function(res) {
                    expect(200);
                    token2 = res.body.token;
                    userId2 = res.body.user_id;
            })

            // Create a new product for test
            await request(app)
                .post('/api/v1/products')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token2)
                .set('user-id', userId2)
                .send({
                    name: 'name_test_cart',
                    image: 'image_test_cart',
                    description: 'description_test_cart',
                    price: 1,
                    amount: 15,
                    userId: userId2
                })
                .then(function(res) {
                    productId = res.body._id;
            })

            //Add product to cart for test
            await request(app)
                .post('/api/v1/carts/' + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
                .send({
                    amount: 10
                })

        });

        afterAll( async() => {
            await request(app)
                .delete(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
            await request(app)
                .delete( '/api/v1/products/' + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token2)
                .set('user-id', userId2)
            await request(app)
                .delete( '/api/v1/users/' + userId1)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
            await request(app)
                .delete( '/api/v1/users/' + userId2)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token2)
                .set('user-id', userId2)
        });

        // Test get cart
        it('Works with put cart', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
                .send({
                    amount : 4
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            "amount": 4,
                            "userId": userId1,
                            "productId": productId
                        })
                    );
                });
        });

        // Test get cart without userid in headers
        it('Works with put cart amount not number', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
                .send({
                    amount: "string"
                })
                .expect(400);
        });

        // Test get cart without userid in headers
        it('Works with put cart amount not defined', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
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
                .set('x-access-token', token1)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with put cart without token', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('user-id', userId1)
                .expect(401);
        });

        // Test get cart without userid in headers
        it('Works with put cart with token not valid', async() => {
            await request(app)
                .put(url + "/" + productId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId1)
                .expect(403);
        });

        // Test get cart without userid in headers
        it('Works with put cart with wrongly formatted id', async() => {
            await request(app)
                .put(url + "/fakeproductid")
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
                .send({
                    amount: 4
                })
                .expect(400);
        });

        // Test get cart without userid in headers
        it('Works with put cart with not existing product', async() => {
            await request(app)
                .put(url + "/1fb69e377cfaa8180c9a37aa")
                .set('Content-Type', 'application/json')
                .set('x-access-token', token1)
                .set('user-id', userId1)
                .send({
                    amount: 4
                })
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
