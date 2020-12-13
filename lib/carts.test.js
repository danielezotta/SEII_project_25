const app = require("./app.js");
const request = require('supertest');
const mongoose = require('mongoose');
const url = "/api/v1/cart";


describe('carts.test', () => {

    beforeAll(() => {
        jest.unmock('mongoose');
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions);
    });

    afterAll( async () => {
        await mongoose.connection.close( true );
    });

    // Get testing
    describe('GET /api/v1/cart/', () => {

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
    describe('PUT /api/v1/cart/', () => {

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

            Add product to cart for test
            await request(app)
                .post('/api/v1/cart/')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    amount: 10,
                    userId: userId,
                    productId: productId
            });

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
    describe('DELETE /api/v1/cart/', () => {

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

            Add product to cart for test
            await request(app)
                .post('/api/v1/cart/')
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
