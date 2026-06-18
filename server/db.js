// use Object Destructuring 
// to import the Pool class from the pool library instead of the whoel module
const {Pool} = require('pg');

// locates the .env file
// parse its contents
// load these variable in Node JS's process.env object
require('dotenv').config(); 

// A Pool creates a cluster of reusable conncections to my Database
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
})

// WE EXPORT THIS POOL, so that any other file in our Node JS application 
// Can query the Database

module.exports = pool;


