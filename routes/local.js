const express = require("express");

const userRoutes = express.Router();
const jwt = require('jsonwebtoken')
const passport = require('passport');

const Pool = require('pg').Pool

console.log(process.env.DB_USER)
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:'users',
    password:process.env.DB_PASSWORD,
    port:5432
})

userRoutes.post("/local/login", 
    async(req, res, next) =>{
        passport.authenticate('login', 
        async (err, user, info) =>{
            console.log(user)
            console.log(info)
            try{
                if(err || !user){
                    return next(new Error('An error occured'))
                }
                req.login(
                    user,
                    {session: true},
                    async(error)=> {
                        if(error) return next (error);
                        const body = {_id: user._id, user: user.user};
                        const token = jwt.sign({user: body}, 'KEY');
                        return res.json({user: user});
                    }
                );
            } catch(error){
                console.log(error)
                return next(error)
            }
        } 
    )(req,res,next);
    }
)

userRoutes.post("/local/register",
    passport.authenticate('signup', {session: false}),
    async(req, res, next)=>{
        if(req.user=='null'){
            console.log('exists')
            res.json({
                message: 'User already exists',
            })
        }
        else{
            res.json({
                message: 'Signup successful',
                user: req.user
            })
        }
    }
)

module.exports = userRoutes;