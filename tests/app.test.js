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

        expect(result.body).toHaveLength(3);
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
                expect(res.body[0].income).toBe(8525)
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

    test('when receipts are created, the amount should be added to the treasury\'s expenditures', async () => {
        let result = await knex('treasury')
            .select('expenditures')

        expect(result).toEqual([{expenditures: 4000}]);
    });

    test('Should be able to view all patch orders', async () => {
        let result = await request(app)
            .get('/1rops/patches')
            .expect(200)

        expect(result.body).toHaveLength(2);
        expect(result.body[0].patchName).toEqual('Crew-1');
    });

    test('New Patch orders should be able to be created which also makes new receipt post', (done) => {
        request(app)
            .post('/1rops/patches')
            .send(
                {
                    patchName: 'Crew-3',
                    amount_ordered: 175,
                    amount_sold: 0,
                    date_ordered: '2021-09-30',
                    income: 0,
                    reason: 'Crew-3 Patches',
                    expenditures: 1200,
                    associated_member: 'Heinze'
                }
            )
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201);
                expect(res.text).toBe('Patch has been successfully added to database');
                done();
            })
            .catch((err) => done(err));
    });

    test('expect, receipts, receipt_patch, and treasury to be updated after patch post', async () => {
        let receipts = await knex('receipts')

        expect(receipts).toHaveLength(7);
        expect(receipts[6].reason).toEqual('Crew-3 Patches');

        let receiptRelations = await knex('receipt_patch')

        expect(receiptRelations).toHaveLength(3);

        let expenditures = await knex('treasury')
            .select('expenditures')

        expect(expenditures).toEqual([{expenditures: 4000}]);
    });

    test('should be able to patch patch entries to update money earned and number sold', (done) => {
        request(app)
            .patch('/1rops/patches/2')
            .send({
                amount_sold: 50,
                income: 400
            })
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201);
                expect(res.body[0].income).toBe(1200);
                expect(res.body[0].amount_sold).toBe(150);
                done();
            })
            .catch((err) => done(err));
    });

    test('patch updates to patch patches should also update the income of the treasury', async () => {
        let income = await knex('treasury')
            .select('income')

        expect(income).toEqual([{income: 8925}]);
    });

    test('should be able to reorder patches and patch the amount_ordered of a certain patch and input a new receipt', (done) => {
        request(app)
            .patch('/1rops/reorder/3')
            .send({
                amount_ordered: 50,
                reason: 'Crew-3 reorder',
                expenditures: 200,
                member_associated: 'Heinze'
            })
            .set('Accept', 'application/json')
            .then( (res) => {
                expect(res.status).toBe(201);
                expect(res.text).toBe('Notice that Patches have been reordered');
                done();
            })
            .catch((err) => done(err));
    });

    test('reorder should add new receipt and update the total amount of patches ordered', async () => {
        const patchUpdate = await knex('patches')
            .select('amount_ordered')
            .where({id: 3});
        const patchReceipt = await knex('receipt_patch');
        const receipts = await knex('receipts');
        const treasury = await knex('treasury')
            .select('expenditures');

        expect(patchUpdate[0].amount_ordered).toBe(225);
        expect(receipts).toHaveLength(8);
        expect(receipts[7].reason).toEqual('Crew-3 reorder');
        expect(patchReceipt).toHaveLength(4);
        expect(treasury[0].expenditures).toEqual(4200);
    });

    test('should be able to retrieve the absolute income from a patch', async () => {
        let result = await request(app)
            .get('/1rops/patches/3')
            .expect(200);

        expect(result.body).toEqual({total: -1400});
    });

    test('should be able to retrieve the absolute income from an event', async () => {
        let result = await request(app)
            .get('/1rops/event/1')
            .expect(200);

        expect(result.body).toEqual({total: 225});
    });

    test('should be able to pull preorders for different patches', async () => {
        let result = await request(app)
            .get('/1rops/preorder/2')
            .expect(200)

        expect(result.body.preOrders).toHaveLength(2);
    });

    test('should be able to post new pre-order list for a patch', (done) => {
        request(app)
            .post('/1rops/preorder/3')
            .send({name: 'Dave Eaton', amount: 200, notes: 'no velcro backing', picked_up: false})
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201)
                expect(res.text).toBe('New pre-order has been added')
                done();
            })
            .catch((err) => done(err));
    });

    test('should be able to update the amount of patches wanted by a member', (done) => {
        request(app)
            .patch('/1rops/preorder/3')
            .send({amount: 50})
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201)
                expect(res.body).toEqual([{
                    name: 'Dave Eaton',
                    amount: 250,
                    notes: 'no velcro backing',
                    picked_up: false
                }])
                done();
            })
            .catch((err) => done(err));
    })
    test('should be able to update the whether or not a member has picked up patches', (done) => {
        request(app)
            .patch('/1rops/preorder/3')
            .send({picked_up: true})
            .set('Accept', 'application/json')
            .then((res) => {
                expect(res.status).toBe(201)
                expect(res.body).toEqual([{
                    name: 'Dave Eaton',
                    amount: 250,
                    notes: 'no velcro backing',
                    picked_up: true
                }])
                done();
            })
            .catch((err) => done(err));
    });

    test('should be able to pull all of the preorders within database', async () => {
        let result = await request(app)
            .get('/1rops/preorder')
            .expect(200)

        expect(result.body).toHaveLength(3);
    })
});