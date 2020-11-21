const app = require("./app.js");
const db = require("./db.js");
const fetch = require("node-fetch");
const url = "http://localhost:8000/api/v1/products"


describe('sellProducts.test', () => {

    let server;

    //Start the server
    beforeAll( () => {
      const port = process.env.PORT || 8000;
        return new Promise( (resolve, reject) => {
            server = app.listen(port, resolve());
            console.log(`Server listening on port ${port}`);
        });


    });

    //Close the server
    afterAll( (done) => {
        console.log(`Closing server`);
        server.close( done() );
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
        console.log(response.status);
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
        console.log(response.status);
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
        console.log(response.status);
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
              expect(response.status).toEqual(500);
              return;
            }
            else if(!data){
              expect(response.status).toEqual(400);
              return;
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
          expect(response.status).toEqual(200);
          expect(json).toEqual(expect.objectContaining({name: "XYZ",
                                  image: "https://i.imgur.com/Jc94DAX.jpeg",
                                  description: "brutto cellulare",
                                  price: 300,
                                  amount: 800,
                                  userId: "5fb291268c27d33204eaf0d3"}));
      });

      //DELETE PRODUCT WITH DYNAMIC ID (IT DOESN'T WORK)

      /*it('works with delete', async () => {
          var id;
          var status;
          var all = await db.products.all(id, await function(err, data){
            id = data[0]._id;
            console.log(id);
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
          console.log(url+"/"+id);
          var response = await fetch(url+"/"+id, {
              method: 'DELETE',
              headers: {
                      'Content-Type': 'application/json',
              }
          });
          expect(response.status).toEqual(status);
        });*/




});
