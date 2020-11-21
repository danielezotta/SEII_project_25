const app = require("./app.js");
const fetch = require("node-fetch");
const urlAddingProduct = "http://localhost:8000/api/v1/products"


describe('sellProducts.test', () => {

    let server;

    beforeAll( () => {
      const port = process.env.PORT || 8000;
        return new Promise( (resolve, reject) => {
            server = app.listen(port, resolve());
            console.log(`Server listening on port ${port}`);
        });


    });

    afterAll( (done) => {
        console.log(`Closing server`);
        server.close( done() );
    });

    /*it('works with get', async () => {
        expect.assertions(1)
        var response = await fetch(urlAddingProduct)
        expect(response.status).toEqual(200)
    });*/

    /*it('works with delete', ()=>{
      return fetch(urlAddingProduct).then(response => expect(response.status).toEqual(200));
    })*/

    /*it('works with post', async () =>{
        return await fetch(urlAddingProduct, {
            method: 'POST',
            body: JSON.stringify({name: "Huawei",
                                  image: "https://i.imgur.com/Jc94DAX.jpeg",
                                  description: "belcellulare",
                                  price: 300,
                                  amount: 800,
                                  userId: "5fb291268c27d33204eaf0d3"}),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => {
              console.log(res.status);
              expect(res.status).toEqual(201)
            })
        .then(data => {
                    console.log(data);
                    expect(data).toEqual(expect.objectContaining({name: "Huawei",
                                            image: "https://i.imgur.com/Jc94DAX.jpeg",
                                            description: "belcellulare",
                                            price: 300,
                                            amount: 800,
                                            userId: "5fb291268c27d33204eaf0d3"}))
                        })
    });*/

    /*it('works with get and post', () => {
        var store=1
        expect.assertions(2);
        return fetch(url)
            .then(r => r.json())
            .then( data => {
                expect(data[0]).toEqual({"id": 21, "name": "HCI"})
                store +=  data[0].id
            } )
            .then(r => {
                return fetch(url, {
                    method: 'POST',
                    body: JSON.stringify({name: 'hello course'+ store}),
                    headers: { 'Content-Type': 'application/json' },
                })
            })
            .then(r => r.json())
            .then( data => {
                expect(data.id).toEqual("hellocourse"+store)
            })
    })


    it('works with get', async () => {
        expect.assertions(1)
        var response = await fetch(url)
        expect(response.status).toEqual(200)
    })*/


    it('works with post', async () => {
        var response = await fetch(urlAddingProduct, {
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

});
