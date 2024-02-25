const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })
const { check,validationResult } = require('express-validator');

require('dotenv').config();
const createError = require('http-errors');
const {mysqlpassword} = require('../database/controllers/database');

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
var mysql2 = require('mysql2');
const {decode} = require('html-entities');


/* define a function that sends one time passwords */

function sendOTP(email, otp) {
    
        //console.log(`auth json ${JSON.stringify(authJson, null, 4)}}`);
        const transporter = nodemailer.createTransport({
            host: process.env.FORWARD_EMAIL_NET_SMTP_SERVER,
            port: process.env.FORWARD_EMAIL_NET_SMTP_PORT,
            secure: false,
            auth: {
            // TODO: replace `user` and `pass` values from:
            // <https://forwardemail.net/guides/send-email-with-custom-domain-smtp>
            user: process.env.FORWARD_EMAIL_NET_EMAIL,
            pass: process.env.FORWARD_EMAIL_NET_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false
            },
        });
        
        var mailOptions = {
            from: `${process.env.FORWARD_EMAIL_NET_EMAIL}`,
            to: `${email}`,
            subject: `Your One-Time Password (OTP)`,
            html: `Hi There!\n <br/>
            Here is your one time password (OTP) :${otp}\n
            <br/>\n`,
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              
            } else {
              console.log(`OTP Email sent: ${info.response}`);
              //console.log(`HTML Sent : ---\n ${orderHtml}\n----\n---\n`);
            }
        });
} ;

/* function that generates an OTP password */

// Generate OTP
function generateOTP() {
    return randomstring.generate({
      length: 6,
      charset: 'numeric'
    });
  }


const loginCheckOutValidation = [
    check('email').isEmail().withMessage('Please enter a valid email address.'),
    check('password').isLength({ min: 1 }).withMessage('Please enter a password.'),
];
module.exports = () => { 
    
    /* generate a pool of mysql connection  */
    var con = mysql2.createPool({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_UPGRADED_NAME,
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle: 4, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });

    
    router.get('/', csrfProtection, (request, response) => { 
        var categories = request.session.categories;
        var userCart = {} ;

        //console.log(`user ${request.session.user} userCart ${request.session.userCart}`);
        //check if user is logged in
        var user = request.session.user;
        if (user ) {
            user = JSON.parse(JSON.stringify(request.session.user)) ;
            console.log(`user : ${JSON.stringify(user)}, current session : ${JSON.stringify(request.session)}`);
            //return response.status(401).send(`You are already logged in as ${user.email}`);
            return response.status(200).send(
                `You are already logged in as ${user.email}\n
                Click <a href="/logout">here</a> to logout\n<br>
                Click <a href="/admin">here</a> to head to your dashboard\n<br>`
            );
        } ;

        user = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
        response.render('layout', { 
            pageTitle: 'Login Page', 
            template: 'login', 
            userCart: userCart,
            csrfToken: request.csrfToken(),
            categories: categories,
            user: user,
            decode:decode,
        });
    });

    
    router.post('/', csrfProtection,loginCheckOutValidation, (request, response) => {
         //check if user is logged in
        var user = request.session.user;
        if (user) {
            user = JSON.parse(JSON.stringify(request.session.user)) ;
            console.log(`user : ${JSON.stringify(user)}, current session : ${JSON.stringify(request.session)}`);
            return response.status(401).send(`You are already logged in as ${user.email}`);
        } ;

        user = {} ;
        
        const email = new String(request.body.email).trim();
        const password = new String(request.body.password).trim();
        //console.log(`email: ${email} password: ${password}`);
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            console.log(`Error processing login form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            return response.status(400).send(`${err_message}`); 
        }     
        
                
        // Check if user exists
        con.execute('SELECT * FROM users WHERE email = ? ', [email], async(err, results) => {
            if (err) {
                console.log(`Error processing login form: ${err}`);
                return response.status(500).send('Internal Server Error');
            } else if (results.length === 0) {
                return response.status(404).send('Login did not seem to work');
            }

            const user = results[0];

            var password_hash = await mysqlpassword(con=con,text=password);
            password_hash = new String(password_hash);
            password_hash = password_hash.toLowerCase();
            var user_pass_hash = new String(user.password_hash);
            user_pass_hash = user_pass_hash.toLowerCase();

            // Verify password
            if (password_hash == user_pass_hash) {
                
                // Generate OTP
                const otp = generateOTP();

                // Store OTP in the database
                con.execute('INSERT INTO otp \
                        (id, user_email, otp_code, expiration_time) \
                        VALUES (id, ?, ?, NOW() + INTERVAL 5 MINUTE)',
                      [user.email, otp], (err, results) => {
                    if (err) {
                        return response.status(500).send('Internal Server Error');
                    }

                    // Send OTP via email
                    sendOTP(user.email, otp);

                    response.send(
                        `Login was successful. <br/>
                         Please check your email and verify your one time password`
                    );
                });
            } else {
                return response.status(404).send('Ouch! login was invalid');

            } ;
        });
    });


    return router;
};


