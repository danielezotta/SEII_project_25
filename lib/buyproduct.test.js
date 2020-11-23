const app = require("./app.js");
const fetch = require("node-fetch");
var jwt = require('jsonwebtoken');

const url = "http://localhost:8000/api/v1/order";
//correct data for test
var key = "passwordSuperSegretaPerGenerareIlToken";
var options = {
    expiresIn: 86400
}
var token = jwt.sign({}, key, options);

let d = new Date(); d = d.getFullYear();
d = parseInt(d) + 1;
var expCard = "12/" + d;

var product_id = "100000000000000000000100";
var user_id = "200000000000000000000000";
var address = "testAddress";
let numCard = "1234";
//----

describe('buyproduct.test', () => {

    const User = require("../models/user");
    const Product = require("../models/product");
    const Order = require("../models/order");
    let userSpy;
    let productSpy;
    let productUpdateSpy;

    //orders to delete
    var ord;

    beforeAll(async () => {
        const port = process.env.PORT || 8000;
        await app.listen(port);
        console.log(`Server listening on port ${port}`);
        

        //intercept find of user
        userSpy = jest.spyOn(User, 'findOne').mockImplementation((params) => {
            switch (params._id) {
                case "200000000000000000000000":
                    return {
                        _id: "200000000000000000000000",
                        email: "test@test.it"
                    };
                    break;
                case "200000000000000000000001":
                    return;
                    break;
                default:
            }          
        });

        //intercept find of product
        productSpy = jest.spyOn(Product, 'findOne').mockImplementation((params) => {
            switch (params._id) {
                case "100000000000000000000100":
                    return {
                        _id: "100000000000000000000100",
                        amount: 100
                    };
                    break;
                case "100000000000000000000001":
                    return {
                        _id: "100000000000000000000001",
                        amount: 1
                    };
                    break;
                default:
                // code block
            } 
        });

        //intercept find and update of product
        productUpdateSpy = jest.spyOn(Product, 'findOneAndUpdate').mockImplementation((params) => {
            return {
                _id: "100000000000000000000000"
            };
        });

        //intercept find and update of product
        productUpdateSpy = jest.spyOn(Product, 'findOneAndDelete').mockImplementation((params) => {
            return {
                _id: "100000000000000000000000"
            };
        });

    });

    afterAll(async () => {
        userSpy.mockRestore();
        productSpy.mockRestore();
        productUpdateSpy.mockRestore();
    });

    //---success with amount > 1 => update
    it('works with put, amount > 1', async() => {    
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(201);
    });
    //---

    //---success with amount == 1 => delete
    it('works with put, amount == 1', async () => {
        let product_id = "100000000000000000000001";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(201);
    });
    //---

    //user_id
    //---400 wrong user_id format
    it('wrong user_id format', async () => {
        let user_id = "wrong";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { error: 'User id bad format' });
    });
    //---
    //---403 user does not exist
    it('user_id not exists', async () => {
        let user_id = "200000000000000000000001";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(403, { error: 'User not found' });
    });
    //---

    //token
    //---403 token not valid
    it('token not valid', async () => {
        let token = "tokennonvalido";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(403, { error: 'Failed to authenticate token' });
    });
    //---

    //address
    //---400 wrong address
    it('wrong address format', async () => {
        let address = "";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "address" });
    });
    //---

    //numCard
    //---400 wrong numCard
    it('wrong numCard format', async () => {
        let numCard = "abcd";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "numCard" });
    });
    //---

    //expCard
    //---400 wrong expCard
    it('wrong expCard format', async () => {
        let expCard = "12/2020/asd";

        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();
        expect(response.status).toEqual(400, { field: "expCard" });
    });
    //---
});