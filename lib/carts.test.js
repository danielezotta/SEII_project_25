const app = require("./app.js");
const request  = require('supertest');
const mongoose = require('mongoose');
const url = "/api/v1/cart";

describe('carts.test', () => {

    beforeAll(() => {
        // jest.setTimeout( 8000 );
        jest.unmock('mongoose');
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions);
    });

    afterAll( async () => {
        await mongoose.connection.close( true );
    });

    describe('GET /api/v1/cart/', () => {

        var productId = "";
        var userId = "";
        var token = "";

        beforeAll( async() => {

            // Create a new user for test
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_cart',
                    surname: 'surname_test_cart',
                    email: 'test_cart@test.it',
                    password: 'password'
                });

            // Authenticate user for testing
            await request(app)
                .post("/api/v1/users/login")
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_cart@test.it",
                    password: "password"
                })
                .then(function(res) {
                    expect(200);
                    token = res.body.token;
                    userId = res.body.user_id;
            });

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
                    amount: 5,
                    userId: userId
                })
                .then(function(res) {
                    productId = res.body._id;
            });

        });

        afterAll( async() => {
            await request(app)
                .delete( '/api/v1/products/' + productId)
                .set('x-access-token', token)
                .set('user-id', userId);
            await request(app)
                .delete( '/api/v1/users/' + userId)
                .set('x-access-token', token)
                .set('user-id', userId);
        });

        // Test get cart
        test('Works with get cart', async() => {
            await request(app)
                .get('/api/v1/cart/')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(200)
        });

        // Test get cart without headers
        it ('GET should return a status of 200 OK', async() => {
            await request(app)
                .get('/api/v1/cart/')
                .expect(401)
        });

    });

});
