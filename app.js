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
    let result = await knex('treasury')
        .select('total')
        .then((data) => data);

    result = result[0];
    res.status(200).send(result);
});

//members routes to list members, establish new members, change a members position, and delete members
app.get('/1rops/members', async (req, res) => {
    let response = await knex
        .select('name', 'position')
        .from('members');

    res.status(200).send(response);
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

app.patch('/1rops/:eventId', async (req, res) => {
    let result;
    let eventId = parseInt(req.params.eventId, 10);
    let change = req.body;

    change.income 
    ? knex('events').increment('income', change.income)
        .where({id: eventId})
        .then((data => data))
    : await knex('events').update({
        date: change.date
    });

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

app.post('/1rops/members', (req, res) => {
    let newMember = req.body;
    if(newMember.name && newMember.position){
        knex('members').insert(newMember);
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