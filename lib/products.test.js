const app = require("./app.js");
const db = require("./db.js");
const fetch = require("node-fetch");
const jwt = require('jsonwebtoken')
const url = "http://localhost:8000/api/v1/products";

var key = 'SE2_project_25';
var options = {
    expiresIn: 86400
}
var token = jwt.sign( {}, key, options );

var productId;
var productId2;

describe('api.test', () => {

    let server;

    beforeAll( () => {
        const port = process.env.PORT || 8000;

        // Promisifying app.listen and return promise,
        // letting Jest wait for its resolution before starting tests.
        // https://github.com/nodejs/node/issues/21482
        // https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Promise
        return new Promise( (resolve, reject) => {
            server = app.listen(port, resolve());
            console.log(`Server listening on port ${port}`);
        });

    });

    afterAll( async (done) => {
        var responseDelete = await fetch(url+"/"+productId2, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                    'user-id': '5fb291268c27d33204eaf0d3',
                    'x-access-token': token
            }
        });
        // Notifying Jest by calling done() in the callback of the close method.
        // No promise used here.
        // https://github.com/visionmedia/supertest/issues/520
        console.log(`Closing server`);
        await server.close( done() );
    });

    // Get products
    it('Works with get products', async () => {
        var response = await fetch(url);
        expect(response.status).toEqual(200);
    });

    // Get product success
    // product id is taken from database, will be changed to id from new product after merge
    it('Works with get product', async () => {
        var response = await fetch(url + "/5fb91302291e8870ac97748a");
        expect(response.status).toEqual(200);
    });

    // Get product error
    // product id is a random non existant product id
    it('Works with get product wrong id', async () => {
        var response = await fetch(url + "/abcabcabcabcabcabcabcabc");
        expect(response.status).toEqual(404);
    });

    //Testing of the api 'adding product'

    //It tests if, given a correct entry example, the server responds with the status 201
    //and verifies if the data returned from the server is the same of the data which is added on the database

    it('works with post product', async () => {
        var response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: 'Huawei',
                                    image: 'https://i.imgur.com/Jc94DAX.jpeg',
                                    description: 'bel cellulare',
                                    price: 300,
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        var json = await response.json();
        productId = json._id;
        expect(response.status).toEqual(201);
        expect(json).toEqual(expect.objectContaining({name: "Huawei",
                                image: "https://i.imgur.com/Jc94DAX.jpeg",
                                description: "bel cellulare",
                                price: 300,
                                amount: 800,
                                userId: "5fb291268c27d33204eaf0d3"}));
    });

    //It tests if, given a data example with an empty string in an attribute, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post product empty string', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: 100,
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseAdd.status).toEqual(400);
    });

    //It tests if, given a data example with incompatible type in an attribute, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product wrong type', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "bla bla",
                                    price: "prezzo sbagliato",
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseAdd.status).toEqual(400);
        var responseUpdate = await fetch(url+"/"+productId, {
            method: 'PUT',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "bla bla",
                                    price: "prezzo sbagliato",
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with price<0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product price<0', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: -5,
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseAdd.status).toEqual(400);
        var responseUpdate = await fetch(url+"/"+productId, {
            method: 'PUT',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: -5,
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with price=0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product price=0', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "blabla",
                                    price: 0,
                                    amount: 800}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseAdd.status).toEqual(400);
        var responseUpdate = await fetch(url+"/"+productId, {
            method: 'PUT',
            body: JSON.stringify({
                                  price: 0
                                }),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with amount<0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product amount<0', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: 300,
                                    amount: -5}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseAdd.status).toEqual(400);
        var responseUpdate = await fetch(url+"/"+productId, {
            method: 'PUT',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: 300,
                                    amount: -5}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseUpdate.status).toEqual(400);
    });

    //It tests if, given a data example with amount=0, it returns
    //the status 400.
    //This test is valid either for the post or the put beacuse the handle of this error is the same in both apis.

    it('works with post/put product amount=0', async () => {
        var responseAdd = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "blabla",
                                    price: 300,
                                    amount: 0}),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        var json = await responseAdd.json();
        productId2 = json._id;
        expect(responseAdd.status).toEqual(201);
        var responseUpdate = await fetch(url+"/"+productId, {
            method: 'PUT',
            body: JSON.stringify({
                                    amount: 0
                                  }),
            headers: {
            'Content-Type': 'application/json',
            'user-id': '5fb291268c27d33204eaf0d3',
            'x-access-token': token
            }
        })
        expect(responseUpdate.status).toEqual(200);
    });

    //Testing the api 'update product'
    //It tests if, given a static id which is in the database, the server returns the right status

    it('works with put product', async () => {
          var response = await fetch(url+"/"+productId, {
              method: 'PUT',
              body: JSON.stringify({name: "XYZ",
                                    description: "brutto cellulare"}),
              headers: {
              'Content-Type': 'application/json',
              'user-id': '5fb291268c27d33204eaf0d3',
              'x-access-token': token
              }
          })
          var json = await response.json();
          expect(response.status).toEqual(200);
          expect(json).toEqual(expect.objectContaining({name: "XYZ",
                                  image: "https://i.imgur.com/Jc94DAX.jpeg",
                                  description: "brutto cellulare",
                                  price: 300,
                                  amount: 0,
                                  userId: "5fb291268c27d33204eaf0d3"}));

      });

      //Testing the api 'update product'
      //It tests if, given a static id of a product which is not in the database, the server returns the status 404

      it('works with put product which not exists', async () => {
            const id = "5fcfb5f93346ed323aaaaaaa" ;
            var response = await fetch(url+"/"+id, {
                method: 'PUT',
                body: JSON.stringify({name: "XYZ",
                                      description: "brutto cellulare"}),
                headers: {
                'Content-Type': 'application/json',
                'user-id': '5fb291268c27d33204eaf0d3',
                'x-access-token': token
                }
            })
            expect(response.status).toEqual(404);
        });

      //It tests if, given a data example with incompatible type in an attribute, it returns
      //the status 400

      it('works with put product wrong type', async () => {
          var response = await fetch(url+"/"+productId, {
              method: 'PUT',
              body: JSON.stringify({name: "Huawei",
                                      image: "https://i.imgur.com/Jc94DAX.jpeg",
                                      description: "bla bla",
                                      price: "prezzo sbagliato",
                                      amount: 800}),
              headers: {
              'Content-Type': 'application/json',
              'user-id': '5fb291268c27d33204eaf0d3',
              'x-access-token': token
              }
          })
          expect(response.status).toEqual(400);
      });



    //Testing of the api 'delete product'
    //It tests if, given a static id, the server responds with the status 200

    it('works with delete product', async () => {
        var response = await fetch(url+"/"+productId, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                    'user-id': '5fb291268c27d33204eaf0d3',
                    'x-access-token': token
            }
        });
        expect(response.status).toEqual(200);
    });

    //Testing of the api 'delete product'
    //It tests if, given a static id, the server responds with the status 404

    it('works with delete product which not exists', async () => {
        var response = await fetch(url+"/"+productId, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                    'user-id': '5fb291268c27d33204eaf0d3',
                    'x-access-token': token
            }
        });
        expect(response.status).toEqual(404);
    });

    //Testing of the apis 'put/delete product'.
    //It tests if, given a bad format id, the server responds with the status 500.
    //This test is valid either for the put or the delete beacuse the handle of this error is the same in both apis.

    it('works with put/delete product with bad format id', async () => {
        const id = "dgdbh";
        var responseDelete = await fetch(url+"/"+id, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
                    'user-id': '5fb291268c27d33204eaf0d3',
                    'x-access-token': token
            }
        });
        expect(responseDelete.status).toEqual(500);
        var responseUpdate = await fetch(url+"/"+id, {
            method: 'PUT',
            headers: {
                    'Content-Type': 'application/json',
                    'user-id': '5fb291268c27d33204eaf0d3',
                    'x-access-token': token
            }
        });
        expect(responseUpdate.status).toEqual(500);
    });


});
