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

app.get('/1rops', async (req, res) => {
    let result = await knex
        .select('*')
        .from('events')

    res.status(200).send(result);
});

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

app.post('/1rops/members', (req, res) => {
    let newMember = req.body;
    if(newMember.name && newMember.position){
        knex('members').insert(newMember);
        res.status(201).send(`Welcome to the 1 ROPS Booster Club ${newMember.name}!`)
    }
});






//export app and knex to run server/allow for use in testing.
module.exports = {app, knex};