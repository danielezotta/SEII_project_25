const app = require("./app.js");
const fetch = require("node-fetch");
const url = "http://localhost:8000/api/v1/products";


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

    afterAll( (done) => {
        // Notifying Jest by calling done() in the callback of the close method.
        // No promise used here.
        // https://github.com/visionmedia/supertest/issues/520
        console.log(`Closing server`);
        server.close( done() );
    });

    // Get products
    it('Works with get users', async () => {
        var response = await fetch(url);
        expect(response.status).toEqual(200);
    });

    // Get product success
    // product id is taken from database, will be changed to id from new product after merge
    it('Works with get user', async () => {
        var response = await fetch(url + "/5fb91302291e8870ac97748a");
        expect(response.status).toEqual(200);
    });

    // Get product error
    // product id is a random non existant product id
    it('Works with get user wrong id', async () => {
        var response = await fetch(url + "/abcabcabcabcabcabcabcabc");
        expect(response.status).toEqual(404);
    });

    //Testing of the api 'adding product'

    //It tests if, given a correct entry example, the server responds with the status 201
    //and verifies if the data returned from the server is the same of the data which is added on the database

    it('works with post', async () => {
        var response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: 'Huawei',
                                    image: 'https://i.imgur.com/Jc94DAX.jpeg',
                                    description: 'bel cellulare',
                                    price: 300,
                                    amount: 800,
                                    userId: '5fb291268c27d33204eaf0d3',}),
            headers: {
            'Content-Type': 'application/json',
            }
        })
        var json = await response.json();
        expect(response.status).toEqual(201);
        expect(json).toEqual(expect.objectContaining({name: "Huawei",
                                image: "https://i.imgur.com/Jc94DAX.jpeg",
                                description: "bel cellulare",
                                price: 300,
                                amount: 800,
                                userId: "5fb291268c27d33204eaf0d3"}));
    });

    //It tests if, given a data example with incompatible type in an attribute, it returns
    //the status 400

    it('works with post', async () => {
        var response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "bla bla",
                                    price: "prezzo sbagliato",
                                    amount: 800,
                                    userId: "5fb291268c27d33204eaf0d3"}),
            headers: {
            'Content-Type': 'application/json',
            }
        })
        var json = await response.json();
        expect(response.status).toEqual(400);
    });

    //It tests if, given a data example with an empty string in an attribute, it returns
    //the status 400

    it('works with post', async () => {
        var response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                    image: "https://i.imgur.com/Jc94DAX.jpeg",
                                    description: "",
                                    price: 100,
                                    amount: 800,
                                    userId: "5fb291268c27d33204eaf0d3"}),
            headers: {
            'Content-Type': 'application/json',
            }
        })
        var json = await response.json();
        expect(response.status).toEqual(400);
    });



    //Testing of the api 'delete product'
    //It tests if, given a static id, the server responds with the right status

    it('works with delete', async () => {
        const id = "5fb931499e857b30c075ca85" ;
        var status;
        var find = await db.products.findOne(id, function(err,data){
          if(err){
            status = 500;
          }
          else if(!data){
            status = 404;
          }
          else{
            status = 200;
          }
        });

        var response = await fetch(url+"/"+id, {
            method: 'DELETE',
            headers: {
                    'Content-Type': 'application/json',
            }
        });
        expect(response.status).toEqual(status);
    });

    //Testing the api 'update product'
    //It tests if, given a static id which is in the database, the server returns the right status

    it('works with put', async () => {
          const id = "5fb93224fc9e7a5c1c0a80de" ;
          var status;
          var find = await db.products.findOne(id, function(err,data){
            if(err){
              status = 500;
            }
            else if(!data){
              status = 404
            }
            else{
              status = 200;
            }
          });

          var response = await fetch(url+"/"+id, {
              method: 'PUT',
              body: JSON.stringify({name: "XYZ",
                                    description: "brutto cellulare"}),
              headers: {
              'Content-Type': 'application/json',
              }
          })
          var json = await response.json();
          expect(response.status).toEqual(status);
          if(status==200){
            expect(json).toEqual(expect.objectContaining({name: "XYZ",
                                  image: "https://i.imgur.com/Jc94DAX.jpeg",
                                  description: "brutto cellulare",
                                  price: 100,
                                  amount: 800,
                                  userId: "5fb291268c27d33204eaf0d3"}));
          }
      });

      //It tests if, given a data example with incompatible type in an attribute, it returns
      //the status 400

      it('works with put', async () => {
          const id = "5fb93224fc9e7a5c1c0a80de" ;
          var response = await fetch(url+"/"+id, {
              method: 'PUT',
              body: JSON.stringify({name: "Huawei",
                                      image: "https://i.imgur.com/Jc94DAX.jpeg",
                                      description: "bla bla",
                                      price: "prezzo sbagliato",
                                      amount: 800,
                                      userId: "5fb291268c27d33204eaf0d3"}),
              headers: {
              'Content-Type': 'application/json',
              }
          })
          var json = await response.json();
          expect(response.status).toEqual(400);
      });
});
