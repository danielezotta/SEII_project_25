const app = require("./app.js");
const fetch = require("node-fetch");
const url = "http://localhost:8000/api/v1/users";


describe('api.test', () => {

    let server;
    let userId;
    let token;

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
        // Notifying Jest by calling done() in the callback of the close method.
        // No promise used here.
        // https://github.com/visionmedia/supertest/issues/520
        console.log(`Closing server`);
        await server.close( done() );
    });

    // Test post user success
    it('Works with post user', async () => {
        var response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Luca",
                surname: "Rossi",
                email: "lucarossi@mail.it",
                password: "password",
            }),
        });
        var json = await response.json(); // Parse json for object verifications
        userId = json._id;
        expect(response.status).toEqual(201);
        expect(json).toEqual(
            expect.objectContaining({
                name: "Luca",
                surname: "Rossi",
                email: "lucarossi@mail.it",
                password: "password",
            })
        );
    });

    // Test post user error
    it('Works with post user params error', async () => {
        var response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Mario",
                surname: "Bianchi",
                email: "mariobianchi.mail.it",
                password: "password",
            }),
        });
        var json = await response.json(); // Parse json for object verifications
        expect(response.status).toEqual(400);
        expect(json).toEqual(
            expect.objectContaining({
                code: "400"
            })
        );
    });


    // Get user success
    it('Works with get user', async () => {
        var response = await fetch(url + "/" + userId);
        expect(response.status).toEqual(200);
    });

    // Get user error
    it('Works with get user wrong id', async () => {
        var response = await fetch(url + "/2fb291268c27d33204eaf0d0");
        expect(response.status).toEqual(404);
    });


    // Test user login success
    it('Works with login', async () => {
        var response = await fetch(url + "/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "lucarossi@mail.it",
                password: "password"
            }),
        });
        var json = await response.json(); // Parse json for object verifications
        token = json.token;
        expect(response.status).toEqual(200);
    });

    // Test user login error email
    it('Works with login email error', async () => {
        var response = await fetch(url + "/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "lucarossi@email.it",
                password: "password"
            }),
        });
        expect(response.status).toEqual(404);
    });

    // Test user login error password
    it('Works with login password error', async () => {
        var response = await fetch(url + "/login", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "lucarossi@mail.it",
                password: "passord"
            }),
        });
        expect(response.status).toEqual(400);
    });

    // Test put user
    it('Works with put user', async () => {
        var response = await fetch(url + "/" + userId, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token,
                'user-id' : userId,
            },
            body: JSON.stringify({
                name: "Mario",
                email: "mariobianchi@mail.it"
            }),
        });
        var json = await response.json(); // Parse json for object verifications
        expect(response.status).toEqual(201);
        expect(json).toEqual(
            expect.objectContaining({
                name: "Mario"
            })
        );
    });

    // Test put user params error
    // it('Works with put user params error', async () => {
    //     var response = await fetch(url + "/" + userId, {
    //         method: "PUT",
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'x-access-token': token,
    //             'user-id' : userId,
    //         },
    //         body: JSON.stringify({
    //             name: "Mario",
    //             email: "mariobianchi.mail.it"
    //         }),
    //     });
    //     var json = await response.json(); // Parse json for object verifications
    //     expect(response.status).toEqual(400);
    //     expect(json).toEqual(
    //         expect.objectContaining({
    //             code: "400"
    //         })
    //     );
    // });

    // Test put user not found
    // it('Works with put user not found', async () => {
    //     var response = await fetch(url + "/5fb943c265adfd2720da0ddd", {
    //         method: "PUT",
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'x-access-token': token,
    //             'user-id' : userId,
    //         },
    //         body: JSON.stringify({
    //             name: "Mario",
    //             email: "mariobianchi@mail.it"
    //         }),
    //     });
    //     var json = await response.json(); // Parse json for object verifications
    //     expect(response.status).toEqual(404);
    //     expect(json).toEqual(
    //         expect.objectContaining({
    //             code: "404"
    //         })
    //     );
    // });

    // Test put user not found
    it('Works with delete user not found', async () => {
        var response = await fetch(url + "/" + userId, {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': token,
                'user-id' : userId,
            }
        });
        expect(response.status).toEqual(200);
    });

});
