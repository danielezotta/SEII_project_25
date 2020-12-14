const request  = require('supertest');
const app      = require('./app.js');
const mongoose = require('mongoose');

// let userId, create a valid token
async function getToken(name_user){
    let login = await request(app).post("/api/v1/users/login")
        .set('Content-Type', 'application/json')
        .send({
            email: name_user+"@testOrder.it",
            password: "password"
        })
    token = login.body.token;
    return token;
}

//correct data for test
var numCard = '1234';
var d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = '12/' + d;
var address = 'testAddress';
var amount = 1;
//----

describe( 'order.test', () => {
    
    beforeAll( async() => {
        jest.setTimeout( 8000 );
        jest.unmock( 'mongoose' );
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
            .catch(error => console.log(error));
        mongoose.set('useFindAndModify', false);
    });

    afterAll( async() => {
        await mongoose.connection.close( true );
    })
    
    //tests for DELETE of an orders
    describe( 'DELETE /api/v1/orders/:id', () => {
        var usr; //user who create and dalete products
        var t_usr; //token
        var product_id;
        var user_id;
        var t_user_id; //token
        var ord1_id;

        beforeAll( async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .set('Content-Type', 'application/json')
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'usr@testOrder.it',
                    password: 'password'
                });
            usr = user.body._id;
            t_usr = await getToken("usr");

            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .set('Content-Type', 'application/json')
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'user_id@testOrder.it',
                    password: 'password'
                });
            user_id = user.body._id;
            t_user_id = await getToken("user_id");

            //creation product
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_id = product.body._id;

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: 1,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            ord1_id = ord.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', t_user_id )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/users/'+usr )
                .set('x-access-token', t_usr )
                .set( 'user-id', usr );
        });

        //---success to delete an orders
        test( 'delete order', async() => {
            var response =  await request( app ).delete( '/api/v1/orders/'+ord1_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( );
            expect( response.status ).toEqual( 200 );
        });
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).delete( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' });
        });
        //---
        //---404  order_id not exists
        test( 'order_id not exists', async () => {    
            var response =  await request( app ).delete( '/api/v1/orders/'+ord1_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' });
        });
        //---
        
    });
    
    //tests for GET of all orders
    describe( 'GET /api/v1/orders', () => {
        var usr; //user who create and dalete products
        var t_usr; //token
        var product_id;
        var user_id;
        var t_user_id;
        var ord1_id;
        var ord2_id;

        beforeAll( async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .set('Content-Type', 'application/json')
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'usr@testOrder.it',
                    password: 'password'
                });
            usr = user.body._id;
            t_usr = await getToken("usr");

            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .set('Content-Type', 'application/json')
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'user_id@testOrder.it',
                    password: 'password'
                });
            user_id = user.body._id;
            t_user_id = await getToken("user_id");

            //creation product with amount >1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_id = product.body._id;

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            ord1_id = ord.body._id;

            //creation order 2
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            ord2_id = ord.body._id;
        });

        afterAll( async () => {
            await request( app ).delete( '/api/v1/orders/'+ord1_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/orders/'+ord2_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id', user_id );
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );       
            await request( app ).delete( '/api/v1/users/'+usr )
                .set('x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', t_user_id )
                .set( 'user-id', user_id );
        });

        //---success to get all orders
        test( 'all orders of id user', async() => {
            var response =  await request( app ).get( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( );

            expect( response.status ).toEqual( 200 );
        });
        //---
    });
    
    //tests for GET of an orders
    describe( 'GET /api/v1/orders/:id', () => {
        var usr; //user who create and dalete products
        var t_usr;
        var product_id;
        var user_id;
        var t_user_id;
        var ord_id;

        beforeAll( async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .set('Content-Type', 'application/json')
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'usr@testOrder.it',
                    password: 'password'
                });
            usr = user.body._id;
            t_usr = await getToken("usr");

            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'user_id@testOrder.it',
                    password: 'password'
                });
            user_id = user.body._id;
            t_user_id = await getToken("user_id");

            //creation product with amount >1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_id = product.body._id;

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            ord_id = ord.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+usr )
                .set('x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', t_user_id )
                .set( 'user-id', user_id );
        });

        //---success to get an orders
        test( 'get specific order', async() => {
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( );
            expect( response.status ).toEqual( 200 );
        });
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' });
        });
        //---
        //---404  product_id not exists
        test( 'order id not exists', async () => {   
            await request( app ).delete( '/api/v1/orders/'+ord_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id', user_id ); 
            var response =  await request( app ).get( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send(  );

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' });
        });
        //---
    });

    //tests for PUT of an orders
    describe( 'PUT /api/v1/orders/:id', () => {
        var usr; //user who create and dalete products
        var t_usr;
        var product_id;
        var user_id;
        var t_user_id;
        var ord_id;

        beforeAll( async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'usr@testOrder.it',
                    password: 'password'
                });
            usr = user.body._id;
            t_usr = await getToken("usr");
            
            //creation user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'user_id@testOrder.it',
                    password: 'password'
                });
            user_id = user.body._id;
            t_user_id = await getToken("user_id");

            //creation product with amount >1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_id = product.body._id;

            //creation order 1
            var ord =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            ord_id = ord.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+usr )
                .set('x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', t_user_id )
                .set( 'user-id', user_id );
        });

        var new_address = "newTestAddress";
        //---success to modify an orders
        test( 'put specific order', async() => {
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    address : new_address 
                                });
            expect( response.status ).toEqual( 200 );
        });
        //---

        //address
        //---400 address not provided
        test( 'address not provided', async () => {
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send(  )
            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' });
        });
        //---
        //---400 wrong address
        test( 'address wrong format', async () => {
            let new_address = '';
            var response =  await request(app).put('/api/v1/orders/'+ord_id)
                                .set('x-access-token', t_user_id)
                                .set('user-id', user_id)
                                .set('Content-Type', 'application/json')
                                .send({
                                    address: new_address
                                });
            expect(response.status).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' });
        });
        //---

        //order_id
        //---400 order id wrong format
        test( 'order id wrong format', async () => {
            let ord_id = 'wrong';
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    address : new_address 
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Order id bad format' });
        });
        //---
        //---404  product_id not exists
        test( 'order id not exists', async () => {   
            await request( app ).delete( '/api/v1/orders/'+ord_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id', user_id ); 
            var response =  await request( app ).put( '/api/v1/orders/'+ord_id )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    address : new_address 
                                });

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'The order associated with user_id not found' });
        });
        //---
    }); 
    
    //tests for POST and control of authentication
    describe( 'POST /api/v1/orders', () => {
        var usr; //user who create and dalete products
        var t_usr;
        var product_id;
        var product_id_amount_1; //to test amount == 1
        var user_id;
        var t_user_id;

        beforeAll( async() => {
            //creation user who create and dalete products
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'usr@testOrder.it',
                    password: 'password'
                });
            usr = user.body._id;
            t_usr = await getToken("usr");

            //creation of an user
            var user = await request( app ).post( '/api/v1/users' )
                .send( {
                    name: 'user_test',
                    surname: 'surname_test',
                    email: 'user_id@testOrder.it',
                    password: 'password'
                });
            user_id = user.body._id;
            t_user_id = await getToken("user_id");

            //creation product with amount >1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1234,
                    userId: usr
                });
            product_id = product.body._id;

            //creation product with amount =1
            var product = await request( app ).post( '/api/v1/products' )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr )
                .send( {
                    name: 'producttest',
                    image: 'testjpg',
                    description: 'test',
                    price: 1234,
                    amount: 1,
                    userId: usr
                });
            product_id_amount_1 = product.body._id;
        });

        afterAll( async() => {
            await request( app ).delete( '/api/v1/products/'+product_id )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+usr )
                .set('x-access-token', t_usr )
                .set( 'user-id', usr );
            await request( app ).delete( '/api/v1/users/'+user_id )
                .set('x-access-token', t_user_id )
                .set( 'user-id', user_id );
        });

        //---success with amount > 1 => update
        test( 'works with post, amount > 1', async() => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            let ord1_id = response.body._id;
            await request( app ).delete( '/api/v1/orders/'+ord1_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id', user_id );
            expect( response.status ).toEqual( 201 );
        });
        //---

        //---success with amount == 1
        test( 'works with post, amount == 1', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id_amount_1,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            let ord2_id = response.body._id;
            var resp = await request( app ).delete( '/api/v1/orders/'+ord2_id )
                .set( 'x-access-token', t_user_id )
                .set( 'user-id',user_id );
            expect( response.status ).toEqual( 201 );
        });
        //---

        //product_id
        //---400 product_id not provided
        test( 'product_id not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' });
        });
        //---
        //---400 product_id not string
        test( 'product_id not string', async () => {
            let product_id = 1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' });
        });
        //---
        //---400 product_id wrong format
        test( 'product_id of a product sell by same user', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_usr )
                                .set( 'user-id', usr )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product cannot be bought from the same seller' });
        });
        //---
        //---400 product_id wrong format
        test( 'product_id wrong format', async () => {
            let product_id = 'wrong';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'Product id bad format' });
        });
        //---
        //---404 product_id not exists
        test( 'product_id not exists', async () => {  
            await request( app ).delete( '/api/v1/products/'+product_id_amount_1 )
                .set( 'x-access-token', t_usr )
                .set( 'user-id', usr );  
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id_amount_1,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'Product not found' });
        });
        //---

        //address
        //---400 address not provided
        test( 'address not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' });
        });
        //---
        //---400 wrong address
        test( 'address wrong format', async () => {
            let address = '';
            var response =  await request(app).post('/api/v1/orders')
                                .set('x-access-token', t_user_id)
                                .set('user-id', user_id)
                                .set('Content-Type', 'application/json')
                                .send({
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });
            expect(response.status).toEqual(400);
            expect( response.body ).toEqual( { success:false, error: 'The field address must be a non-empty string, in string format' });
        });
        //---

        //numCard
        //---400 numCard not provided
        test( 'numCard not provided', async () => {
            var response =  await request(app).post('/api/v1/orders')
                                .set('x-access-token', t_user_id)
                                .set('user-id', user_id)
                                .set('Content-Type', 'application/json')
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' });
        });
        //---
        //---400 wrong numCard
        test( 'numCard wrong format', async () => {
            let numCard = 'abcd';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' });
        });
        //---
        //---400 negative numCard
        test( 'numCard negative number', async () => {
            let numCard = -1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field numCard must be a non-empty string, in number format' });
        });
        //---

        //amount
        //---400 amount not provided
        test( 'amount not provided', async () => {
            var response =  await request(app).post('/api/v1/orders')
                                .set('x-access-token', t_user_id)
                                .set('user-id', user_id)
                                .set('Content-Type', 'application/json')
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---400 wrong amount
        test( 'amount wrong format', async () => {
            let amount = 'abcd';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---400 negative amount
        test( 'amount negative number', async () => {
            let amount = -1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field amount must be a non-empty string, in number format >=1' });
        });
        //---
        //---404 amount > products available
        test( 'amount > of available products', async () => {
            let amount = 1235;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 404 );
            expect( response.body ).toEqual( { success:false, message: 'Product not available' });
        });
        //---

        //expCard
        //---400 expCard not provided
        test( 'expCard not provided', async () => {
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' });
        });
        //---
        //---400 wrong expCard
        test( 'expCard wrong format(MM/YYYY/NNNN)', async () => {
            let expCard = '12/2020/1234';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' });
        });
        //---
        //---400 expCard not a string
        test( 'expCard not a string', async () => {
            let expCard = 1234;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' });
        });
        //---
        //---400 expCard without '/'
        test( 'expCard without /', async () => {
            let expCard = '12/2020/1234';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'The field expCard must be a non-empty string, in MM/YYYY format' });
        });
        //---
        //---400 expCard year length != 4
        test( 'expCard with year lenght != 4', async () => {
            let expCard = '12/202';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' });
        });
        //---
        //---400 expCard negative year 
        test( 'expCard with negative year', async () => {
            let expCard = '12/-123';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' });
        });
        //---
        //---400 expCard with year < current year
        test( 'expCard with year < current year', async () => {
            let expCard = '12/2019';
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'year not valid' });
        });
        //---
        //---400 expCard with month > 12 
        test( 'expCard with month > 12', async () => {
            let expCard = '120/' + d;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' });
        });
        //---
        //---400 expCard with month < current month 
        test( 'expCard with month < current month', async () => {
            let expCard = '01/' + (parseInt(d)-1);
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' });
        });
        //---
        //---400 expCard with negative month  
        test( 'expCard with negative month', async () => {
            let expCard = '-1/' + d;
            var response =  await request( app ).post( '/api/v1/orders' )
                                .set( 'x-access-token', t_user_id )
                                .set( 'user-id', user_id )
                                .set( 'Content-Type', 'application/json' )
                                .send( {
                                    product_id: product_id,
                                    address: address,
                                    amount: amount,
                                    numCard: numCard,
                                    expCard: expCard
                                });

            expect( response.status ).toEqual( 400 );
            expect( response.body ).toEqual( { success:false, error: 'month not valid' });
        });
        //---
    });
});
