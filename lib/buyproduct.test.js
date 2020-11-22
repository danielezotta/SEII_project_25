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
                _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
                email:"test@test.it"
            };        
        });

        //intercept find of product
        productSpy = jest.spyOn(Product, 'findOne').mockImplementation((params) => {
            return {
                _id: "aaaaaaaaaaaaaaaaaaaaaaaa",
                amount: 100
            };
        });

        //intercept find and update of product
        productUpdateSpy = jest.spyOn(Product, 'findOneAndUpdate').mockImplementation((params) => {
            return {
                _id: "aaaaaaaaaaaaaaaaaaaaaaaa"
            };
        });

        //intercept find and update of product
        productUpdateSpy = jest.spyOn(Product, 'findOneAndDelete').mockImplementation((params) => {
            return {
                _id: "aaaaaaaaaaaaaaaaaaaaaaaa"
            };
        });

    });

    afterAll(async () => {
        userSpy.mockRestore();
        productSpy.mockRestore();
        productUpdateSpy.mockRestore();
    });

    it('works with put', async() => {
        let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MDYwMzUyMDgsImV4cCI6MTYwNjEyMTYwOH0.e_beHa_XdydAXxHaG8Ol2Nad3nHP4QTx8oEEqLIazo8";
        let product_id = "aaaaaaaaaaaaaaaaaaaaaaaa";
        let user_id = "aaaaaaaaaaaaaaaaaaaaaaaa";
        let address = "prova";
        let numCard = "12312";
        let expCard = "11/2021";
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