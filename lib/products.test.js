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
});