const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const bycrypt = require('bcrypt');
const session = require('express-session');
const saltRounds = 10;
const Pool = require('pg').Pool
const JWTSTrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const GoogleStrategy = require('passport-google-oauth2').Strategy

console.log(process.env.DB_USER)

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database:'users',
    password:process.env.DB_PASSWORD,
    port:5432
})

passport.serializeUser(function(user, done) {
    console.log(user)
    console.log("serialized")
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log("deserialized")
    done(null, user)
});

passport.use(
    new JWTSTrategy(
        {
            secretOrKey: 'KEY',
            jwtFromRequest: ExtractJWT.fromUrlQueryParameter('secret_token')
        },
        async(token, done) =>{
            try{
                return done(null, token.user)
            }
            catch(error){
                done(error);
            }
        }
    )
)

passport.use(
    'google',
    new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:5000/google/login/callback",
        passReqToCallback : true
    },
    function(req, accessToken, refreshToken, profile, done){
        console.log(profile);
        session.token = refreshToken;
        req.login(profile.displayName, function(err){
            if(err){
                return next(err);
            }
        })
        try{
            const q1 = `SELECT * FROM google_users WHERE "user"=$1`
            pool.query(q1, [profile.id], (err, result)=>{
                if(result.rowCount>0){
                    done(null, profile.displayName)
                }
                else{
                    const q = `
                    INSERT INTO google_users VALUES ($1, $2, $3)
                    `
                    values = [profile.id, profile.displayName, profile.email]
                    pool.query(q, values, (err, result) =>{
                        done(null, profile.displayName);
                    })
                }
            })
        }
        catch(error){
            console.log(error);
            done(error);
        }
    })
)
passport.use(
    'signup',
    new localStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async(req, email, password, done) =>{
            bycrypt.hash(password, saltRounds, (error, hash)=>{
                try{
                    const q1 = `SELECT * FROM users WHERE user=$1 OR email=$2`
                    pool.query(q1, [req.body.user, email], (err, result)=>{
                        if(result.rowCount>0){
                            console.log(result);
                            return done(null, 'null')
                        }
                        else{
                            const q = `
                            INSERT INTO users VALUES ($1, $2, $3)
                            `
                            values = [req.body.user, email, hash]
                            pool.query(q, values, (err, result) =>{
                                console.log(result);
                                return done(null, req.body.user);
                            })
                        }
                    })
                }
                catch(error){
                    console.log(error);
                    done(error);
                }
            })
        }
    )
)

passport.use(
    'login', 
    new localStrategy(
        {
            usernameField: 'user',
            passwordField: 'password'
        },
        async(user, password, done) =>{

            const q = `
            SELECT password FROM users WHERE "user"=$1
            `
            values = [user]
            console.log(values)
            pool.query(q, values, (err, result) =>{
                if(err){
                    console.log(err)
                    done(err)
                }
                else{
                    console.log(result)
                    if(result.rows.length==0){
                        console.log("none")
                        return done(null, false, {message: 'User not found'})
                    }
                    const compPass = result.rows[0].password;
                    console.log(result);
                    bycrypt.compare(password, compPass, (error, response)=>{
                        if(response){
                            console.log(response);
                            return done(null, user, {message: 'Successful Login'});
                        }
                        else{
                            console.log(error);
                            return done(null, false, {message: 'Wrong Password'})
                        }
                    })
                }
            })
        }
    )
)