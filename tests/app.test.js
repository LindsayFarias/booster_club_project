const { app, knex } = require('../app');
const request = require('supertest');
const { response } = require('express');

describe('Booster club app\'s backend server', () => {
    beforeAll(() => {
        return knex.migrate
            .latest()
            .then( () => knex.seed.run());
    })

    afterAll(() => {
        return knex.migrate
            .rollback()
            .then(() => knex.destroy());
    })

    test('should provide output list of events at /1rops', async () => {
        let result = await request(app)
            .get('/1rops')
            .expect(200)
        
        expect(result.body).toBeDefined();
        expect(result.body).toHaveLength(2);
    });

    test('should be able to pull more data about an event when event is selected', async () => {
        let result = await request(app)
            .get('/1rops/1')
            .expect(200)
        
        expect(result.body).toHaveProperty('committee');
        expect(result.body).toHaveProperty('receipts');
        expect(typeof result).toEqual('object');
    })

    test('should send error back if an input into route does not exist', async () => {
        let result = await request(app)
            .get('/1rops/6')
            .expect(404)

        expect(result.text).toBe('Error, event not found!')
    })

    test('should be able to create new member profiles', (done) => {
        request(app)
            .post('/1rops/members')
            .send({name: 'Daniel Egert', position: 'Treasurer'})
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.text).toBe('Welcome to the 1 ROPS Booster Club Daniel Egert!');
                done();
            })
            .catch((err) => done(err));
    });

})