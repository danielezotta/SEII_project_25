const app = require("./app.js");
const db = require("./db.js");
const fetch = require('node-fetch');
var jwt = require('jsonwebtoken');

const url = "http://localhost:8000/api/v1/order";
//correct data for test
var key = "SE2_project_25";
var options = {
    expiresIn: 86400
}
var token = jwt.sign({}, key, options);

let d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = "12/" + d;

var product_id;
var product_id_amount_1; //to test amount == 1
var user_id;
var ord1_id;
var ord2_id;
var address = "testAddress";
var numCard = "1234";
//----

describe('buyproduct.test', () => {

    beforeAll(async() => {
        const port = process.env.PORT || 8000;
        app.listen(port);
        console.log(`Server listening on port ${port}`);
        
        db.products.insert({name: "producttest",
                            image: "testjpg",
                            description: "test",
                            price: 1234,
                            amount: 1234,
                            userId: "000000000000000000000000" }, function (err, data) {
            product_id = data._id;
            return;
        });
        db.products.insert({name: "producttest",
                            image: "testjpg",
                            description: "test",
                            price: 1234,
                            amount: 1,
                            userId: "000000000000000000000000"}, function (err, data) {
            product_id_amount_1 = data._id;
        });
        
        db.users.insert({name: "user_test",
                                          surname: "surname_test",
                                          email: "test@test.it",
                                          password: "abcd"}, function (err, data) {       
            user_id = data._id;
        });         
          
        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        
        while(product_id==undefined || product_id_amount_1==undefined || user_id==undefined){
            await sleep(100);
        }    
    });

    afterAll(() => {
        
        db.products.deleteOne({"_id": product_id_amount_1}, function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
        });

        db.users.deleteOne({"_id": user_id}, function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
        });

        
        
    });

    //---success with amount > 1 => update
    test('works with post, amount > 1', async() => {
        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id,
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        let ord = await response.json();
        ord1_id = ord.id_order;

        db.orders.deleteOne({"_id": ord1_id}, function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
        });
        expect(response.status).toEqual(201);
    });
    //---

    //---success with amount == 1 => delete
    test('works with post, amount == 1', async () => {
        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id_amount_1,
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        let ord = await response.json();
        ord2_id = ord.id_order;

        db.orders.deleteOne({"_id": ord2_id}, function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
        });       
        expect(response.status).toEqual(201);
    });
    //---

    //product_id
    //---400  product_id wrong format
    test('wrong product_id format', async () => {
        let product_id = "wrong";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id,
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { error: 'Product id bad format' });
    });
    //
    //---404  product_id not exists
    test('product_id not exists', async () => {
        db.products.deleteOne({"_id": product_id}, async function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
            var response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 
                           'x-access-token': token,
                           'user-id': user_id },
                body: JSON.stringify({ product_id: product_id, 
                                       address: address, 
                                       numCard: numCard, 
                                       expCard: expCard }),
            });
    
            ord = await response.json();
            expect(response.status).toEqual(404, { field: 'id_product' });
        });     
    });
    //
    
    //token
    //---403 token not valid
    test('token not valid', async () => {
        let token = "tokennonvalido";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id, 
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(403, { error: 'Failed to authenticate token' });
    });
    //---

    //address
    //---400 wrong address
    test('wrong address format', async () => {
        let address = "";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token, 
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id, 
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "address" });
    });
    //---

    //numCard
    //---400 wrong numCard
    test('wrong numCard format', async () => {
        let numCard = "abcd";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id, 
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "numCard" });
    });
    //---

    //expCard
    //---400 wrong expCard
    test('wrong expCard format', async () => {
        let expCard = "12/2020/asd";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id, 
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "expCard" });
    });
    //---

    //user_id
    //---400 wrong user_id format
    test('wrong user_id format', async () => {
        let user_id = "wrong";

        var response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 
                       'x-access-token': token,
                       'user-id': user_id },
            body: JSON.stringify({ product_id: product_id,
                                   address: address, 
                                   numCard: numCard, 
                                   expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { error: 'User id bad format' });
    });
    //---
    //---403 user does not exist
    test('user_id not exists', async () => {
        db.users.deleteOne({"_id": user_id}, async function (err, st) {
            if(err){
                console.log("Problem with delete, you must control db")
            }
            var response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 
                           'x-access-token': token,
                           'user-id': user_id },
                body: JSON.stringify({ product_id: product_id,
                                       address: address, 
                                       numCard: numCard, 
                                       expCard: expCard }),
            });
    
            ord = await response.json();
            expect(response.status).toEqual(404, { error: 'User not found' });
        });      
    });
    //---

});