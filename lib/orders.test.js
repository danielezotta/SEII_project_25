const request  = require('supertest');
const app      = require('./app.js');
const jwt      = require('jsonwebtoken')
const mongoose = require('mongoose');
const Product = require('../models/product.js');
const Order = require('../models/order.js');
const User = require('../models/user.js');

var product_id;
var product_id_amount_1; //to test amount == 1
var user_id;
var ord1_id;
var ord2_id;

//correct data for test
var key = "SE2_project_25";
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

let d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = "12/" + d;
var address = "testAddress";
var numCard = "1234";
//----

describe( 'POST /api/v1/orders', () => {
    let connection;

    beforeAll( async() => {

        jest.setTimeout( 8000 );
        jest.unmock( 'mongoose' );
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        connection = await  mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch( error => console.log(error) );
        console.log( 'Database connected!' );

        //creation user
        var user = await request(app).post('/api/v1/users')
            .send({
                name: "user_test",
                surname: "surname_test",
                email: "test@test.it",
                password: "abcd"
            });
        user_id = user.body._id;

        //creation product with amount >1
        var product = await request(app).post('/api/v1/products')
            .set('x-access-token', token)
            .set('user-id', user_id)
            .send({
                name: "producttest",
                image: "testjpg",
                description: "test",
                price: 1234,
                amount: 1234,
                userId: user_id
            });
        product_id = product.body._id;

        //creation product with amount =1
        var product = await request(app).post('/api/v1/products')
            .set('x-access-token', token)
            .set('user-id', user_id)
            .send({
                name: "producttest",
                image: "testjpg",
                description: "test",
                price: 1234,
                amount: 1,
                userId: user_id
            });
        product_id_amount_1 = product.body._id;

    });

    afterAll( async () => {
        await mongoose.connection.close( true );
        console.log( "Database connection closed" );
    });

    //---success with amount > 1 => update
    test( 'works with post, amount > 1', async() => {
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

        ord1_id = response.body._id;
        await request(app).delete('/api/v1/orders/'+ord1_id)
            .set('x-access-token', token)
            .set('user-id', user_id);
        expect( response.status ).toEqual( 201 );
    });
    //---

    //---success with amount == 1 => delete
    test( 'works with post, amount == 1', async () => {
        var response =  await request(app).post('/api/v1/orders')
                            .set('x-access-token', token)
                            .set('user-id', user_id)
                            .set('Accept', 'application/json')
                            .send({
                                product_id: product_id_amount_1,
                                address: address,
                                numCard: numCard,
                                expCard: expCard
                            });

        ord2_id = response.body._id;
        await request(app).delete('/api/v1/orders/'+ord2_id)
            .set('x-access-token', token)
            .set('user-id', user_id);
        expect(response.status).toEqual(201);
    });
    //---

    //product_id
    //---400  product_id wrong format
    test('wrong product_id format', async () => {
        let product_id = "wrong";
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

        expect(response.status).toEqual(400, { error: 'Product id bad format' });
    });
    //
    //---404  product_id not exists
    test('product_id not exists', async () => {
        await request(app).delete('/api/v1/products/'+product_id)
            .set('x-access-token', token)
            .set('user-id', user_id);

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

        expect(response.status).toEqual(404, { field: 'id_product' });
    });
    //---

    //token
    //---403 token not valid
    test('token not valid', async () => {
        let token = "tokennonvalido";
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

        expect(response.status).toEqual(403, { error: 'Failed to authenticate token' });
    });
    //---

    //address
    //---400 wrong address
    test('wrong address format', async () => {
        let address = "";
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
        expect(response.status).toEqual(400, { field: "address" });
    });
    //---

    //numCard
    //---400 wrong numCard
    test('wrong numCard format', async () => {
        let numCard = "abcd";
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

        expect(response.status).toEqual(400, { field: "numCard" });
    });
    //---

    //expCard
    //---400 wrong expCard
    test('wrong expCard format', async () => {
        let expCard = "12/2020/asd";
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

        expect(response.status).toEqual(400, { field: "expCard" });
    });
    //---

    //user_id
    //---400 wrong user_id format
    test('wrong user_id format', async () => {
        let user_id = "wrong";
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

        expect(response.status).toEqual(400, { error: 'User id bad format' });
    });
    //---
    //---403 user does not exist
    test('user_id not exists', async () => {
        await request(app).delete('/api/v1/products/'+product_id_amount_1)
            .set('x-access-token', token)
            .set('user-id', user_id);
        await request(app).delete('/api/v1/users/'+user_id)
            .set('x-access-token', token)
            .set('user-id', user_id);

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
        expect(response.status).toEqual(404, { error: 'User not found' });
    });
    //---
});
