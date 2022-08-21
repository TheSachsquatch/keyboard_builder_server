const express = require('express')
const dotenv = require('dotenv').config()
const port = process.env.PORT || 5000
const passport = require('passport')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const session = require('express-session')
const cors = require('cors')
const app = express()
const pgSession = require('connect-pg-simple')(session);

console.log(process.env.DB_USER)

const Pool = require('pg').Pool

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:'users',
    password:process.env.DB_PASSWORD,
    port:5432
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(cookieParser())
app.use(session({store: new pgSession({
    pool:pool, tableName: 'session'
}), resave: false, saveUninitialized: false, secret: 'randomsecret', cookie: {maxAge: 30*24*60*60*1000}, cookie: {
    maxAge: 1000 * 60 * 10
}}));
app.use(passport.initialize());
app.use(passport.session());

app.use(cors({
    origin: ["http://localhost:4200", "http://localhost:4200/register", "http://localhost:4200/build", "https://accounts.google.com/o/oauth2/v2/auth"],
    methods: ["GET", "HEAD",  "POST", "PUT", "DELETE"],
    credentials: true,
}))

require("./auth/auth")

const savedBuilds = require('./routes/savedBuilds')

app.use(require("./routes/products"))

app.use(require("./routes/local"))

app.use(require("./routes/google"))

app.get('/loggedIn', (req, res,next)=>{
    console.log(req.session)
    if(req.isAuthenticated()){
        res.json({user: req.user})
    }
})

app.get('/logout', (req,res,next)=>{
    console.log('logout')
    if(req.isAuthenticated()){
        req.session.destroy();
    }
})

app.use('/user', savedBuilds)

app.use(function(err, req, res, next) {
    //res.status(err.status || 500);
    res.json({error:err});
})
app.listen(port, "0.0.0.0", () =>{
    console.log(`Server started at ${port}`)
})
