//Express acts as your server
const express = require('express');
//include other dependencies as well
const morgan = require('morgan');
const cors = require('cors');
//bring in your database from knex
const knex = require('knex')(require('./knexfile.js')[process.env.NODE_ENV||'development']);
//invoke express
const app = express();

//turn on everything that you will be using
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(morgan('dev'));
app.use(
    cors({
        origin: '*',
        methods: "GET"
    })
);

//make the various different routes, sending information from the database
//using knex selector queries.

//home route will list all upcoming events
app.get('/1rops', async (req, res) => {
    let result = await knex
        .select('*')
        .from('events')

    res.status(200).send(result);
});

app.get('/1rops/money', async (req, res) => {
    let income = await knex('treasury')
        .select('income')
        .then((data) => data);

    let expenditures = await knex('treasury')
        .select('expenditures')
        .then((data) => data);
    
    income = income[0].income;
    expenditures = expenditures[0].expenditures;

    result = {total: income - expenditures};
    res.status(200).send(result);
});

app.get('/1rops/receipts', async (req, res) => {
    const result = await knex('receipts')

    res.status(200).send(result);
})

//members routes to list members, establish new members, change a members position, and delete members
app.get('/1rops/members', async (req, res) => {
    let response = await knex
    .select('name', 'position')
    .from('members');
    
    res.status(200).send(response);
});

app.get('/1rops/preorder', async (req, res) => {
    let response = await knex
        .select('po.name', 'po.amount', 'po.notes', 'po.picked_up', 'p.patchName')
        .from('pre_orders as po')
        .leftJoin('patch_preOrder as pp', 'pp.preOrder', '=', 'po.id')
        .leftJoin('patches as p', 'p.id', 'pp.patch');

    res.status(200).send(response);
});

//route to get all previous patch orders
app.get('/1rops/patches', async (req, res) => {
    let result = await knex('patches')
        .then((data) => data);

    res.status(200).send(result);
});

app.get('/1rops/patches/:patchId', async (req, res) => {
    let patchId = parseInt(req.params.patchId);

    let income = await knex('patches')
        .select('income')
        .where({id: patchId})
        .then((data) => data);
    income = income[0].income;
    const expenditures = await knex
        .select('r.expenditures')
        .from('receipts AS r')
        .where('rp.patch', patchId)
        .innerJoin('receipt_patch AS rp', 'r.id', '=', 'rp.receipt')
        .then((data) => data);

    let count = 0;
    expenditures.forEach( (el) => {return count += el.expenditures});
    
    total = {total: income - count};

    res.status(200).send(total);
});


app.get('/1rops/preorder/:patchId', async (req, res) => {
    let patchId = parseInt(req.params.patchId, 10);
    let patchName = await knex('patches')
        .select('patchName')
        .where({id: patchId})
        .then(data => data);
    patchName = patchName[0].name;
    let result = await knex
        .select('name', 'amount', 'notes', 'picked_up')
        .from('pre_orders as po')
        .where('pp.patch', patchId)
        .innerJoin('patch_preOrder as pp', 'pp.preOrder', '=', 'po.id')
        .then( data => data)

    res.status(200).send({patchName: patchName, preOrders: result});
});

app.get('/1rops/event/:eventId', async (req, res) => {
    let eventId = parseInt(req.params.eventId);

    let income = await knex('events')
        .select('income')
        .where({id: eventId})
        .then((data) => data);
    income = income[0].income;
    const expenditures = await knex
        .select('r.expenditures')
        .from('receipts AS r')
        .where('re.event', eventId)
        .innerJoin('receipt_event AS re', 'r.id', '=', 're.receipt')
        .then((data) => data);

    let count = 0;
    expenditures.forEach( (el) => {return count += el.expenditures});
    
    total = {total: income - count};

    res.status(200).send(total);
});

//route to get specific details about events to include receipts and committee
app.get('/1rops/:event', async (req, res) => {
    //get params from request
    const eventId = parseInt(req.params.event, 10);
    
    //search for the committee members 
    const committee = await knex
    .select('name')
    .from('members AS m')
    .where('ec.event', eventId)
    .innerJoin('event-committee AS ec', 'm.id', '=', 'ec.member')
    
    //search for associated receipts
    const receipts = await knex
    .select('*')
    .from('receipts as r')
    .where('re.receipt', eventId)
    .innerJoin('receipt_event AS re', 're.event', '=', 'r.id')
    
    //what is the selected event
    const event = await knex
    .select('*')
    .from('events')
    .where('id', eventId);
    
    const response = {event: event, committee: committee, receipts: receipts};
    
    //if event is not found, send back error
    if(response.event.length === 0) res.status(404).send('Error, event not found!');
    else res.status(200).send(response);
});

app.patch('/1rops/patches/:patchId', async (req, res) => {
    const patchId = parseInt(req.params.patchId, 10);
    const updateInfo = req.body;
    const soldPatches = updateInfo.amount_sold;
    const incomeIncrease = updateInfo.income;

    await knex('patches')
        .increment('amount_sold', soldPatches)
        .increment('income', incomeIncrease)
        .where({id: patchId})
        .then((data) => data);
    await knex('treasury')
        .increment('income', incomeIncrease)
        .then((data) => data);
    const result = await knex('patches')
        .where({id: patchId})
        .then((data) => data);

    res.status(201).send(result);
})

app.patch('/1rops/reorder/:patchId', async (req, res) => {
    const patchId = parseInt(req.params.patchId, 10);
    const updateInfo = req.body;
    const patchIncrease = updateInfo.amount_ordered;
    const newReceipt = {
        reason: updateInfo.reason,
        associated_member: updateInfo.associated_member,
        expenditures: updateInfo.expenditures
    };

    await knex('patches')
        .increment('amount_ordered', patchIncrease)
        .where({id: patchId})
        .then((data) => data);
    await knex('receipts')
        .insert(newReceipt)
        .then((data) => data);
    await knex('treasury')
        .increment('expenditures', newReceipt.expenditures);

    let receiptId = await knex('receipts')
        .select('id')
        .where({reason: newReceipt.reason})
        .then((data) => data);
    receiptId = receiptId[0].id;

    await knex('receipt_patch')
        .insert({receipt: receiptId, patch: patchId})
        .then((data) => data);

    res.status(201).send('Notice that Patches have been reordered');
});

app.patch('/1rops/:eventId', async (req, res) => {
    let result;
    let eventId = parseInt(req.params.eventId, 10);
    let change = req.body;

    change.income 
    ? await knex('events').increment('income', change.income)
        .where({id: eventId})
        .then((data => data))
    : await knex('events')
        .update({
        date: change.date
        })
        .where({id: eventId});

    if(change.income){
        await knex('treasury')
            .increment('income', change.income)
            .then((data => data))
        result = await knex('treasury');
    } else {
        result = await knex('events')
            .where({id: eventId});
    };
    res.status(201).send(result);
});

app.patch('/1rops/members/:memberID', async (req, res) => {
    let memberId = parseInt(req.params.memberID, 10);
    console.log(memberId)
    let updateInfo = req.body;
    
    knex('members')
    .where({id: memberId})
    .update(updateInfo)
    .then((data) => data)
    
    let result =  await knex
    .select('*')
    .from('members')
    .where({id: memberId})
    .then((data) => data)
    
    result = result[0];
    
    res.status(201).send(result);
});

app.patch('/1rops/preorder/:preOrderId', async (req, res) => {
    let preOrderId = parseInt(req.params.preOrderId, 10);
    let change = req.body;
    
    console.log(change.amount);
    change.amount 
    ? await knex('pre_orders').increment('amount', change.amount)
        .where({id: preOrderId})
        .then((data => data))
    : await knex('pre_orders')
        .update({
        picked_up: change.picked_up
        })
        .where({id: preOrderId});

    const result = await knex('pre_orders')
        .select('name', 'amount', 'notes', 'picked_up' )
        .where({id: preOrderId})
        .then(data => data);

    res.status(201).send(result);
});

app.post('/1rops/members', async (req, res) => {
    let newMember = req.body;
    if(newMember.name && newMember.position){
        await knex('members').insert(newMember);
        res.status(201).send(`Welcome to the 1 ROPS Booster Club ${newMember.name}!`)
    }
});

app.post('/1rops', async (req, res) => {
    let newEvent = req.body;

    knex('events')
        .insert(newEvent)
        .then((data) => data);

    knex('treasury')
        .increment('income', newEvent.income)
        .then((data) => data);

    res.status(201).send(newEvent)
});

app.post('/1rops/patches', async (req, res) => {
    const incomingInfo = req.body;

    const newPatch = {
        patchName: incomingInfo.patchName,
        date_ordered: incomingInfo.date_ordered,
        amount_ordered: incomingInfo.amount_ordered,
        amount_sold: incomingInfo.amount_sold,
        income: incomingInfo.income
    };

    const newReceipt = {
        reason: incomingInfo.reason,
        associated_member: incomingInfo.associated_member,
        expenditures: incomingInfo.expenditures
    };

    await knex('receipts')
        .insert(newReceipt)
        .then((data) => data);

    await knex('patches')
        .insert(newPatch)
        .then((data) => data);

    let receiptId = await knex('receipts')
        .select('id')
        .where({reason: newReceipt.reason})
        .then((data) => data);
    receiptId = receiptId[0].id;

    let patchId = await knex('patches')
        .select('id')
        .where({patchName: newPatch.patchName})
        .then((data) => data);
    patchId = patchId[0].id;

    await knex('receipt_patch')
        .insert({receipt: receiptId, patch: patchId})
        .then((data) => data);

    res.status(201).send('Patch has been successfully added to database')
});

app.post('/1rops/preorder/:patchId', async (req, res) => {
    let patchId = parseInt(req.params.patchId, 10);
    let newPreorder = req.body;

    await knex('pre_orders')
        .insert(newPreorder)
        .then((data) => data);

    let preOrderId = await knex('pre_orders')
        .max('id')
        .then((data) => data);
    preOrderId = preOrderId[0].max

    await knex('patch_preOrder')
        .insert({patch: patchId, preOrder: preOrderId})
        .then((data) => data);

    res.status(201).send('New pre-order has been added')
});

app.post('/1rops/:event', async (req, res) => {
    const eventId = parseInt(req.params.event, 10);
    const newReceipt = req.body;

    if(
        newReceipt.reason &&
        newReceipt.expenditures &&
        newReceipt.associated_member
    ){
        knex('receipts')
            .insert(newReceipt)
            .then((data) => data);
        res.status(201);
    }

    await knex('treasury')
        .increment('expenditures', newReceipt.expenditures);

    let receiptId = await knex('receipts')
        .select('id')
        .where({reason: newReceipt.reason})
        .then((data) => data);

    receiptId = receiptId[0].id

    knex('receipt_event')
        .insert({event: eventId, receipt: receiptId})
        .then((data) => data);
    res.send('Receipt successfully uploaded!');
});


app.delete('/1rops/members/:memberId', (req, res) => {
    let memberId = parseInt(req.params.memberId, 10);
    
    knex('members')
    .delete('*')
    .where({id: memberId})
    .then((data) => data);
    
    knex('event-committee')
    .delete('*')
    .where({member: memberId})
    .then((data) => data);
    
    res.status(200);
});




//export app and knex to run server/allow for use in testing.
module.exports = {app, knex};