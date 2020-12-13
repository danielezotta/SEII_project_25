const app = require("./app.js");
const request = require("supertest");
const mongoose = require('mongoose');
const url = "/api/v1/users";


describe('users.test', () => {

    beforeAll( () => {
        jest.unmock('mongoose');
        var mongooseOptions = {useNewUrlParser: true, useUnifiedTopology: true};
        mongoose.connect('mongodb+srv://SEII_project_25:SEII_project_25@se2-project-25.7b2jc.mongodb.net/SEII_project_25?retryWrites=true&w=majority', mongooseOptions);
    });

    afterAll( async () => {
        await mongoose.connection.close(true);
    });

    // Post testing
    describe('POST /api/v1/users/', () => {

        var userId;
        var token;

        afterAll( async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_users_post@test.it",
                    password: "password"
                })
                .then(function(res) {
                    token = res.body.token;
                })
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        })

        // Test post user success
        it('Works with post user', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .send({
                    name: "name_test_users",
                    surname: "surname_test_users",
                    email: "test_users_post@test.it",
                    password: "password",
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            name: "name_test_users",
                            surname: "surname_test_users",
                            email: "test_users_post@test.it"
                        })
                    );
                })
                .then(function(res) {
                    userId = res.body._id;
                })
        });

        // Test post user error
        it('Works with post user params error', async () => {

            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .send({
                    name: "name_test_users",
                    surname: "surname_test_users",
                    email: "test_users_post.test.it",
                    password: "password",
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

        // Test post user error
        it('Works with post user params not found', async () => {
            await request(app)
                .post(url)
                .set('Content-Type', 'application/json')
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

    });

    // Get testing
    describe('GET /api/v1/users/:id', () => {

        var userId;
        var token;

        beforeAll( async () => {
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_users',
                    surname: 'surname_test_users',
                    email: 'test_users_get@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                })

            await request(app)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test_users_get@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    token = res.body.token;
                })
        });

        afterAll( async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        });

        // Get user success
        it('Works with get user without login headers', async () => {
            await request(app)
                .get(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            self: "/api/v1/users/" + userId,
                            name: "name_test_users"
                        })
                    );
                });
        });

        // Get user success
        it('Works with get user with login headers', async () => {
            await request(app)
                .get(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            self: "/api/v1/users/" + userId,
                            name: "name_test_users",
                            surname: "surname_test_users",
                            email: "test_users_get@test.it"
                        })
                    );
                });
        });

        // Get user error
        it('Works with get user id bad format', async () => {
            await request(app)
                .get(url + '/fakeuserid')
                .set('Content-Type', 'application/json')
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

        // Get user error
        it('Works with get user not found', async () => {
            await request(app)
                .get(url + '/1fb69e377cfaa8180c9a37aa')
                .set('Content-Type', 'application/json')
                .expect(404)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "404"
                        })
                    );
                });
        });

    });

    // Login testing
    describe('POST /api/v1/users/login', () => {

        var userId = "";
        var token = "";

        beforeAll( async () => {
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_users',
                    surname: 'surname_test_users',
                    email: 'test_users_login@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                })
        });

        afterAll( async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        })

        // Test user login success
        it('Works with login', async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_users_login@test.it",
                    password: "password"
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            message: 'Token generated successfully!',
                            user_id: userId
                        })
                    );
                })
                .then(function(res) {
                    token = res.body.token;
                });
        });

        // Test user login error
        it('Works with login email error', async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_users_login_wrong@test.it",
                    password: "password"
                })
                .expect(404)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "404"
                        })
                    );
                });
        });

        // Test user login error
        it('Works with login password error', async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_users_login@test.it",
                    password: "password_wrong"
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

        // Test user login error
        it('Works with login password missing', async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: "test_users_login@test.it"
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400",
                            message: "The field 'password' is not valid."
                        })
                    );
                });
        });

        // Test user login error
        it('Works with login email missing', async () => {
            await request(app)
                .post(url + '/login')
                .set('Content-Type', 'application/json')
                .send({
                    password: "password"
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400",
                            message: "The field 'email' is not valid."
                        })
                    );
                });
        });

    });

    // Put testing
    describe('PUT /api/v1/users/:id', () => {

        var userId = "";
        var token = "";

        beforeAll( async () => {
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_users',
                    surname: 'surname_test_users',
                    email: 'test_users_put@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                });

            await request(app)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test_users_put@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    token = res.body.token;
                })
        });

        afterAll( async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        });

        // Test put user success
        it('Works with put user', async () => {
            await request(app)
                .put(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    name: "name_test_users_new",
                    password: "password_new"
                })
                .expect(201)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            name: "name_test_users_new"
                        })
                    );
                });
        });

        // Test put user error
        it('Works with put user header and param not matching', async () => {
            await request(app)
                .put(url + '/1fb69e377cfaa8180c9a37aa')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    email: "name_test_users@test.it"
                })
                .expect(403)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            "code": "403",
                            "message": "User not corresponding."
                        })
                    );
                });
        });


        // Test put user error
        it('Works with put user wrong email format', async () => {
            await request(app)
                .put(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .send({
                    email: "name_test_users.test.it"
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

        // Test put user error
        it('Works with put user wrong user id format', async () => {
            await request(app)
                .put(url + '/fakeuserid')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', 'fakeuserid')
                .send({
                    email: "name_test_users@test.it"
                })
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
            				"code": "400",
                			"message": 'The user-id header is badly formatted.'
                		})
                    );
                });
        });

        // Test put user error
        it('Works with put user wrong not found', async () => {
            await request(app)
                .put(url + '/1fb69e377cfaa8180c9a37aa')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', '1fb69e377cfaa8180c9a37aa')
                .send({
                    email: "name_test_users@test.it"
                })
                .expect(404)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                			"code": "404",
                			"message": 'The user-id header can not be found.'
                		})
                    );
                });
        });

        // Test put user error
        it('Works with put user without login headers', async () => {
            await request(app)
                .put(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .send({
                    email: "name_test_users@test.it"
                })
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                			code: "401",
                			message: 'No token provided.'
                		})
                    );
                });
        });

        // Test put user success
        it('Works with put user with invalid token', async () => {
            await request(app)
                .put(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId)
                .send({
                    name: "name_test_users_new",
                    password: "password_new"
                })
                .expect(403)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "403"
                        })
                    );
                });
        });


    });

    // Delete testing
    describe('DELETE /api/v1/users/:id', () => {

        var userId = "";
        var token = "";

        beforeAll( async () => {
            await request(app)
                .post('/api/v1/users')
                .set('Content-Type', 'application/json')
                .send({
                    name: 'name_test_users',
                    surname: 'surname_test_users',
                    email: 'test_users_delete@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    userId = res.body._id;
                });

            await request(app)
                .post('/api/v1/users/login')
                .set('Content-Type', 'application/json')
                .send({
                    email: 'test_users_delete@test.it',
                    password: 'password'
                })
                .then(function(res) {
                    token = res.body.token;
                })
        });

        afterAll( async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
        });

        // Test delete user error
        it('Works with delete user with invalid token', async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', 'token')
                .set('user-id', userId)
                .expect(403)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "403"
                        })
                    );
                });
        });

        // Test delete user success
        it('Works with delete user', async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', userId)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            self: url + "/" + userId
                        })
                    );
                });
        });

        // Test delete user error
        it('Works with delete user id wrong format', async () => {
            await request(app)
                .delete(url + '/fakeuserid')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', 'fakeuserid')
                .expect(400)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "400"
                        })
                    );
                });
        });

        // Test delete user error
        it('Works with delete user not found', async () => {
            await request(app)
                .delete(url + '/1fb69e377cfaa8180c9a37aa')
                .set('Content-Type', 'application/json')
                .set('x-access-token', token)
                .set('user-id', '1fb69e377cfaa8180c9a37aa')
                .expect(404)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                            code: "404"
                        })
                    );
                });
        });

        // Test delete user error
        it('Works with delete user without login headers', async () => {
            await request(app)
                .delete(url + '/' + userId)
                .set('Content-Type', 'application/json')
                .expect(401)
                .expect((res) => {
                    expect(res.body).toEqual(
                        expect.objectContaining({
                			code: "401",
                			message: 'No token provided.'
                		})
                    );
                });
        });
    });
});
