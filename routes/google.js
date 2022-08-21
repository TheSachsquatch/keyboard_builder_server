const express = require('express')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const passportG = require('passport-google-oauth2')

const router = express.Router();

router.get("/google/login/callback",async(req,res,next)=>{
    console.log("huh")
    passport.authenticate('google', async (err, user) =>{
        console.log("yuh")
        var responseHTML = '<html><head><title>Main</title></head><body></body><script>res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>'
        responseHTML = responseHTML.replace('%value%', JSON.stringify({
            user: user
        }));
        res.status(200).send(responseHTML);
    }) (req,res,next);
})

router.get("/google/login", passport.authenticate('google',  {scope: ['profile', 'email']}));


module.exports = router;
