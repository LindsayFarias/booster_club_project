const { app, knex } = require('../app');
const request = require('supertest');
const { response } = require('express');

describe('Booster club app\'s backend server', () => {
    beforeAll(() => {
        return knex.migrate
            .latest()
            .then( () => knex.seed.run());
    });

    afterAll(() => {
        return knex.migrate
            .rollback()
            .then(() => knex.destroy());
    });

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
    });

    test('should send error back if an input into route does not exist', async () => {
        let result = await request(app)
            .get('/1rops/6')
            .expect(404)

        expect(result.text).toBe('Error, event not found!')
    });

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

    test('should provide list of members with /1rops/members route', async () => {
        let result = await request(app)
            .get('/1rops/members')
            .expect(200)

        expect(result.body).toHaveLength(2);
        expect(result.body[0]).toHaveProperty('name');
    });

    test('should allow patches to be made to members position at /1rops/members/:memberID', (done) => {
        request(app)
            .patch('/1rops/members/2')
            .send({position: 'Vice President'})
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.body).toEqual({id: 2, name: 'Lindsay Farias', position: 'Vice President'});
                done();
            })
            .catch((err) => done(err));
    });

    test('should delete member from all tables with /1rops/members/:memberId', async () => {
        request(app)
            .delete('/1rops/members/2')
            .expect('Content-Type', /json/)
            .expect(200)
            .then((res) => {
                expect(res.body).to.have.property('success', true);
            })
    });

    test('should be able to post new receipts into database /1rops/{event}', (done) => {
        let result = request(app)
            .post('/1rops/1')
            .send({
                reason: 'Reserved Christmas Party venue', 
                expenditures: 2500, 
                associated_member: 'Farias'
            })
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201);
                expect(res.text).toBe('Receipt successfully uploaded!')
                done();
            })
            .catch((err) => done(err));
    });

    test('should be able to get current amount in booster club treasury', async () => {
        let result = await request(app)
            .get('/1rops/money')
            .expect(200)
        
        expect(typeof result).toEqual('object');
        expect(result.body.total).toBe(1000);
    });

    test('new events should be able to be created', (done) => {
        request(app)
            .post('/1rops')
            .send({
                title: 'Thanksgiving Potluck',
                date: '2021-11-23',
                about: 'Squadron Thanksgiving celebration',
                income: 25
            })
            .set('Accept', 'application/json')
            .then((res) => {
                expect(typeof res).toEqual('object')
                expect(res.body).toEqual({
                    title: 'Thanksgiving Potluck',
                    date: '2021-11-23',
                    about: 'Squadron Thanksgiving celebration',
                    income: 25
                });
                done();
            })
            .catch((err) => done(err));
    });

    test('income from events should be added to treasury when income is patched', (done) => {
        request(app)
            .patch('/1rops/1')
            .send({income: 3500})
            .set('Accept', 'application/json')
            .expect(201)
            .then((res) => {
                expect(res.body[0].income).toBe(6025)
                done();
            })
            .catch((err) => done(err));
    });

    test('patch route /1rops/{event} will also let you update the date of event', (done) => {
        request(app)
            .patch('/1rops/1')
            .send({date: '2021-12-15'})
            .set('Accept', 'application/json')
            .expect(201)
            .then((res) => {
                expect(res.body[0].date).toContain('2021-12-15');
                done();
            })
            .catch(err => done(err));
    });
})