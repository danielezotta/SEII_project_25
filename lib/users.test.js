const app = require("./app.js");
const fetch = require("node-fetch");
const url = "http://localhost:8000/api/v1/users";


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

    // Get user
    it('Works with get user', async () => {
        expect.assertions(1);
        var response = await fetch(url + "/5fb291268c27d33204eaf0d3");
        expect(response.status).toEqual(200);
    });

    // Test post user
    it('Works with post user', async () => {
        expect.assertions(2); // Number of expect()
        var response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Santo",
                surname: "Annino",
                email: "fotocopie@brazzers.com",
                password: "ilprogettodellemedie",
            }),
        });
        var json = await response.json(); // Parse json for object verifications
        expect(response.status).toEqual(201);
        expect(json).toEqual(
            expect.objectContaining({
                name: "Santo",
                surname: "Annino",
                email: "fotocopie@brazzers.com",
                password: "ilprogettodellemedie"
            })
        );
    });

});
