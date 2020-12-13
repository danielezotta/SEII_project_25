const app = require("./app.js");
const db = require("./db.js");
const request   = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose  = require('mongoose');
const url = "/api/v1/products";

//Creation of token

var key = 'SE2_project_25';
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

//Ids of trial products and user

var productId;
var productId2;
var userId;

//Tests

describe('Tests of all apis concerning products', () => {

    let server;

    //Creation of database connection and trial user

    beforeAll( async () => {
      jest.setTimeout( 8000 );
      jest.unmock( 'mongoose' );
      var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
      connection = await  mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions)
          .catch( error => console.log(error) );
      console.log( 'Database connected!' );

      const user = await request(app).post("/api/v1/users")
          .send({
              name: "Luca",
              surname: "Rossi",
              email: "lucarossi@mail.it",
              password: "password",
          });
      userId = user.body._id;
    });

    //Elimination of trial user and product
    //The product with productId as id will be eliminated bu the test of 'delete product'

    afterAll( async (done) => {
        var responseDelete = await request(app).delete(url+"/"+productId2)
        .set('Content-Type', 'application/json')
        .set( 'x-access-token', token )
        .set( 'user-id', '5fb291268c27d33204eaf0d3')
        .send();

        var userDelete = await request(app).delete("/api/v1/users/"+userId)
        .set('Content-Type', 'application/json')
        .set( 'x-access-token', token )
        .set( 'user-id', userId)
        .send();

    });

    //Testing of the api 'get products'
    //It tests if the server responds with the status 200

    it('Works with get products', async () => {
        var response = await request(app).get(url);
        expect(response.status).toEqual(200);
    });

    //Testing of the api 'get product'
    //It tests if, given a correct id, the server responds with the status 200

    it('Works with get product', async () => {
        var response = await request(app).get(url + "/5fb91302291e8870ac97748a");
        expect(response.status).toEqual(200);
    });

    //Testing of the api 'get product'
    //It tests if, given a not existing id, the server responds with the status 404

    it('Error 404 with get product wrong id', async () => {
        var response = await request(app).get(url + "/abcabcabcabcabcabcabcabc");
        expect(response.status).toEqual(404);
    });

    //Testing of the api 'adding product'

    //It tests if, given a correct entry example, the server responds with the status 201
    //and verifies if the data returned from the server is the same of the data which is added on the database

    it('works with post product', async () => {
        var response = await request(app).post(url)
        .set('Content-Type', 'application/json')
        .set( 'x-access-token', token )
        .set( 'user-id', '5fb291268c27d33204eaf0d3')
        .send({name: 'Huawei',
               image: 'https://i.imgur.com/Jc94DAX.jpeg',
               description: 'bel cellulare',
               price: 300,
               amount: 800});
        productId = response.body._id;
        expect(response.status).toEqual(201);
    });

    //It tests if, given a data example with an empty string in an attribute, it returns
    //the status 400.

    it('Error 400 with post product empty string', async () => {
        var responseAdd = await request(app).post(url)
        .set('Content-Type', 'application/json')
        .set( 'x-access-token', token )
        .set( 'user-id', '5fb291268c27d33204eaf0d3')
        .send({name: "Huawei",
               image: "https://i.imgur.com/Jc94DAX.jpeg",
               description: "",
               price: 100,
               amount: 800});
        expect(responseAdd.status).toEqual(400);
    });

    //It tests if, given a data example with incompatible type in an attribute, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('Error 400 with post/put product wrong type', async () => {
      //POST
      var responseAdd = await request(app).post(url)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "bla bla",
             price: "prezzo sbagliato",
             amount: 800});
      expect(responseAdd.status).toEqual(400);

      //PUT
      var responseUpdate = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "bla bla",
             price: "prezzo sbagliato",
             amount: 800});
      expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with price<0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('Error 400 with post/put product price<0', async () => {
      //POST
      var responseAdd = await request(app).post(url)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "",
             price: -5,
             amount: 800});
      expect(responseAdd.status).toEqual(400);

      //PUT
      var responseUpdate = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "",
             price: -5,
             amount: 800});
      expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with price=0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('Error 400 with post/put product price=0', async () => {
      //POST
      var responseAdd = await request(app).post(url)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "bla bla",
             price: 0,
             amount: 800});
      expect(responseAdd.status).toEqual(400);

      //PUT
      var responseUpdate = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({price:0});
      expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with amount<0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('Error 400 with post/put product amount<0', async () => {
      //POST
      var responseAdd = await request(app).post(url)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "",
             price: 300,
             amount: -5});
      expect(responseAdd.status).toEqual(400);

      //PUT
      var responseUpdate = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "",
             price: 300,
             amount: -5});
      expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with amount=0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product amount=0', async () => {
      //POST
      var responseAdd = await request(app).post(url)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             image: "https://i.imgur.com/Jc94DAX.jpeg",
             description: "blabla",
             price: 300,
             amount: 0});
      productId2 = responseAdd.body._id;
      expect(responseAdd.status).toEqual(201);

      //PUT
      var responseUpdate = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({amount: 0});
      expect(responseUpdate.status).toEqual(200);
    });

    //Testing the api 'update product'
    //It tests if, given a static id which is in the database, the server returns the status 200

    it('works with put product', async () => {
      var response = await request(app).put(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "XYZ",
             description: "cellulare"});
      expect(response.status).toEqual(200);
    });

    //Testing the api 'update product'
    //It tests if, given a static id of a product which is not in the database, the server returns the status 404

    it('Error 404 with put product which not exists', async () => {
      const id = "5fcfb5f93346ed323aaaaaaa" ;
      var response = await request(app).put(url+"/"+id)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send({name: "Huawei",
             description: "cellulare"});
      expect(response.status).toEqual(404);
    });

    //Testing the api 'update product'
    //It tests if, given a static bad format id, the server returns the status 400

    it('Error 400 with put product with bad format id', async() =>{
      const id = "dgdbh";
      var responseUpdate = await request(app).put(url+"/"+id)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send();
      expect(responseUpdate.status).toEqual(400);
    });

    //Testing of the api 'delete product'
    //It tests if, given a static id, the server responds with the status 200

    it('works with delete product', async () => {
      var response = await request(app).delete(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send();
      expect(response.status).toEqual(200);
    });

    //Testing of the api 'delete product'
    //It tests if, given a static id, the server responds with the status 404

    it('Error 404 with delete product which not exists', async () => {
      var response = await request(app).delete(url+"/"+productId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send();
      expect(response.status).toEqual(404);
    });

    //Testing of the apis 'put/delete product'.
    //It tests if, given a bad format id, the server responds with the status 500.
    //This test is valid either for the put or the delete beacuse the handle of this error is the same in both apis.

    it('Error 400 with delete product with bad format id', async () => {
      const id = "dgdbh";
      var responseDelete = await request(app).delete(url+"/"+id)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3')
      .send();
      expect(responseDelete.status).toEqual(400);
    });

    //Testing of the apis 'get products by userId'
    //It tests if, given a correct userId, the server responds with the status 200.

    it('Works with get products by userId', async () => {
      var response = await request(app).get(url+"/myProducts/"+userId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3');
      expect(response.status).toEqual(200);
    });

    //Testing of the apis 'get products by userId'
    //It tests if, given a bad format userId, the server responds with the status 400.

    it('Error 400 with get products by bad format userId', async () => {
      var response = await request(app).get(url+"/myProducts/"+"5fb91302291e8870")
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3');
      expect(response.status).toEqual(400);
    });

    //Testing of the apis 'get products by userId'
    //It tests if, given a bad format userId, the server responds with the status 404.

    it('Error 404 with get products by not existing userId', async () => {
      var response = await request(app).get(url+"/myProducts/"+"5fcfb5f93346ed323aaaaaaa")
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3');
      expect(response.status).toEqual(404);
    });

    //Testing of the apis 'get orders by userId'
    //It tests if, given a correct userId, the server responds with the status 200.

    it('Works with get orders by userId', async () => {
      var response = await request(app).get(url+"/myOrders/"+userId)
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3');
      expect(response.status).toEqual(200);
    });

    //Testing of the apis 'get orders by userId'
    //It tests if, given a bad format userId, the server responds with the status 400.

    it('Error 400 with get orders by bad format userId', async () => {
      var response = await request(app).get(url+"/myOrders/"+"5fb91302291")
      .set('Content-Type', 'application/json')
      .set( 'x-access-token', token )
      .set( 'user-id', '5fb291268c27d33204eaf0d3');
      expect(response.status).toEqual(400);
    });

    //Testing of the apis 'get orders by userId'
    //It tests if, given a not existing userId, the server responds with the status 404.

    it('Error 404 with get orders by not existing userId', async () => {
        var response = await request(app).get(url+"/myOrders/"+"5fcfb5f93346ed323aaaaaaa")
        .set('Content-Type', 'application/json')
        .set( 'x-access-token', token )
        .set( 'user-id', '5fb291268c27d33204eaf0d3');
        expect(response.status).toEqual(404);
    });




});
