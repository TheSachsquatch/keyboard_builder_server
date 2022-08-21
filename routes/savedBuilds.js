const express = require('express');
const router = express.Router();
const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:'users',
    password:process.env.DB_PASSWORD,
    port:5432
})

router.get(
    '/saved',
    (req,res, next) =>{
        const q = `
            SELECT * FROM builds WHERE "user"=$1
        `
        values = [req.user]
        pool.query(q, values, (err, result) =>{
            if(err){
                console.log(err)
            }
            else{
                console.log(result.rows);
                res.json({
                    user: req.user,
                    builds: result.rows
                })
            }
        })
    }
)

router.post('/addBuild', (req, res)=>{
    const q1 = `SELECT * FROM builds WHERE "name"=$2 AND "user"=$1`
    const q = `
        INSERT INTO builds VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `
    values = req.body.body
    pool.query(q1, [values[0],values[6]], (err, result)=>{
        if(result.rowCount>0){
            res.json({
                message: "a build with this name already exists, would you like to overwrite?"
            })
        }
        else{
            pool.query(q, values, (err, result)=>{
                res.json({
                    message: "saved build"
                })
            })
        }
    })
})

router.post('/editBuild', (req,res)=>{
    const q = `DELETE FROM builds WHERE "user"=$1 AND "name"=$2`
    const q2 = `INSERT INTO builds VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
    values = req.body.body
    console.log(values);
    try{
        pool.query(q, [values[0],values[6]], (err, result)=>{
        })
        pool.query(q2, values, (err, result)=>{
            res.json({
                message: "saved build"
            })
        })
    }
    catch(error){
        console.log(error)
    }
})

router.post('/deleteBuild', (req,res)=>{
    const q = `DELETE FROM builds WHERE "user"=$1 AND "name"=$2`
    pool.query(q, [req.body.user,req.body.name], (err, result)=>{
    })
})

module.exports = router;