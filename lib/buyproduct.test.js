const app = require("./app.js");
const fetch = require("node-fetch");
const url = "http://localhost:8000/api/v1/order";

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
            return {
                _id: "200000000000000000000000",
                email:"test@test.it"
            };        
        });

        //intercept find of product
        productSpy = jest.spyOn(Product, 'findOne').mockImplementation((params) => {
            if (params._id == "100000000000000000000100") {
                return {
                    _id: "100000000000000000000100",
                    amount: 100
                };
            } else {
                return {
                    _id: "100000000000000000000001",
                    amount: 1
                };
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

    //success with amount > 1 => update
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

    //success with amount == 1 => delete
    it('works with put, amount == 1', async () => {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDYwMzUyMDgsImV4cCI6MTYwNjEyMTYwOH0.e_beHa_XdydAXxHaG8Ol2Nad3nHP4QTx8oEEqLIazo8";
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
});