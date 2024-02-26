const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })
const { check,validationResult } = require('express-validator');

require('dotenv').config();
const createError = require('http-errors');
const {mysqlpassword} = require('../database/controllers/database');
const {decode, encode} = require('html-entities');

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');
var mysql2 = require('mysql2');


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
            subject: `Your one time password (OTP) is: ${otp}`,
            html: `Hi There!\n <br/>
            Here is your one time password (OTP) :${otp}\n
            <br/>\n
            It expires in about 5 minutes.`,
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

const verifyOTPcheckOutValidation = [
    check('user_email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('otp').isLength({ min: 1 }).withMessage('Please enter your One Time Password'),
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
    
    router.post('/', csrfProtection,verifyOTPcheckOutValidation, (request, response) => {
        
            const user_email = new String(request.body.user_email).trim();
            const otp = new String(request.body.otp).trim();
        
            // Verify OTP
            con.execute('SELECT * FROM otp WHERE user_email = ? AND otp_code = ? AND expiration_time > NOW()', [user_email, otp], (err, results) => {
                if (err) {
                    console.log(err);
                    return response.status(500).send('Internal Server Error');
                }
                if (results.length == 0) {
                    console.log(`Results given : ${JSON.parse(JSON.stringify(results))}`);
                    return response.status(401).send('Invalid or expired OTP');
                }
        
                // Delete OTP from the database
                con.execute('DELETE FROM otp WHERE user_email = ?', [user_email], (err, results) => {
                    if (err) {
                        console.log(err);
                        return response.status(500).send('Internal Server Error');
                    }

                    /* Add user as a new session user */
                    request.session.user = {
                        email: user_email,
                        password: null,
                        authenticated: true
                    } ;

                    request.session.save();
            
                    return response.status(200).send(
                        `OTP successfully verified\n<br/>
                        You are logged in as ${user_email}\n
                        Click <a href="/logout">here</a> to logout\n<br>
                        Click <a href="/admin">here</a> to head to your dashboard\n<br>`
                    );
                });
            
            });     
    
        
    });

    return router;
};


