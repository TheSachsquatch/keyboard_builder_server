const express = require("express")

const products = express.Router();

const request = require('request')

const Pool = require('pg').Pool

console.log(process.env.DB_USER)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:'products',
    password:process.env.DB_PASSWORD,
    port:5432
})

products.route('/products/getBoard').get((req,res) =>{
    let search_query = req.query.search;
    const search_type = req.query.type;
    search_query+=":*";
    console.log(search_query)
    console.log(search_type)
    const text = `
    SELECT * FROM ${search_type} WHERE ts @@ to_tsquery('english', $1)
    `
    values = [search_query]
    pool.query(text, values, (err, result) =>{
        if(err){
            console.log(err)
        }
        else{
            res.json(result)
        }
    })
})

module.exports = products;