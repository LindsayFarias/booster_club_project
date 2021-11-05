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








//export app and knex to run server/allow for use in testing.
module.exports = {app, knex};