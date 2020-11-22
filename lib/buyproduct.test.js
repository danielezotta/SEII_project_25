const app = require("./app.js");
const fetch = require("node-fetch");
var jwt = require('jsonwebtoken');

const url = "http://localhost:8000/api/v1/order";
var key = "passwordSuperSegretaPerGenerareIlToken";

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
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDYwMzUyMDgsImV4cCI6MTYwNjEyMTYwOH0.e_beHa_XdydAXxHaG8Ol2Nad3nHP4QTx8oEEqLIazo8";
        let product_id = "100000000000000000000100";
        let user_id = "200000000000000000000000";
        let address = "testAddress";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
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
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000000";
        let address = "testAddress";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
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
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000100";
        let user_id = "wrong";
        let address = "testAddress";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(400);
    });
    //---
    //---403 user does not exist
    it('user_id not exists', async () => {
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000001";
        let address = "testAddress";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        expect(response.status).toEqual(403);
    });
    //---

    //token
    //---403 token not valid
    it('token not valid', async () => {
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = "tokennonvalido";
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000001";
        let address = "testAddress";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        expect(response.status).toEqual(403);
    });
    //---

    //address
    //---400 wrong address
    it('wrong address format', async () => {
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000000";
        let address = "";
        let numCard = "1234";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(400);
    });
    //---

    //numCard
    //---400 wrong numCard
    it('wrong numCard format', async () => {
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000000";
        let address = "testAddress";
        let numCard = "abcd";
        let d = new Date(); d = d.getFullYear();
        d = parseInt(d) + 1;
        let expCard = "12/" + d;
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(400);
    });
    //---

    //expCard
    //---400 wrong expCard
    it('wrong expCard format', async () => {
        let options = {
            expiresIn: 86400 // expires in 24 hours
        }
        let token = jwt.sign({}, key, options);
        let product_id = "100000000000000000000001";
        let user_id = "200000000000000000000000";
        let address = "testAddress";
        let numCard = "1234";
        let expCard = "12/2020/asd";
        var response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-access-token': token },
            body: JSON.stringify({ product_id: product_id, user_id: user_id, address: address, numCard: numCard, expCard: expCard }),
        });

        ord = await response.json();

        await Order.findOneAndDelete({ "_id": ord.id_order }, null);
        expect(response.status).toEqual(400);
    });
    //---
});