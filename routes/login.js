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
const {decode,encode} = require('html-entities');
const {Email,VALID_EMAIL_REGEXP, isEmailValid} = require('../utilities/email');
const {OTP_CODE_SIZE} = require('../utilities/functions');
const { defaultMySQLDBConnectorConfig } = require('../database/models/MySQLDBConnector');

/* This is the only email regular expression used to check emails  */
const loginCheckOutValidation = [
    check('email').matches(VALID_EMAIL_REGEXP).withMessage('Please enter a valid email address.'),
    check('password').isLength({ min: 1 }).withMessage('Please enter a password.'),
];
/* define a function that sends one time passwords */

function sendOTP(email, otp) {
    
    return new Promise(async(resolve, reject) => {
        

        var mailOptions = {
            from: `${process.env.BCC_ORDER_EMAIL}`,
            to: `${email}`,
            subject: `Your One-Time Password (OTP)`,
            html: 
            `<html>
                <body>
                    <p>
                        Hi There!\n <br/>
                        Here is your one time password (OTP) :<h3>${otp}</h3>\n
                        It expires in 15 minutes.
                        <br/>\n 
                    </p>
                </body>
            </html>`,
        };
        try{

            var emailSending = new Email();
            emailSending.sendEmail(mailOptions.to, mailOptions.subject, mailOptions.html).
            then(
                (result) => {
                    console.log(`OTP Email sent: ${JSON.stringify(result)}`);
                    resolve(result);
                }
            ).catch(err => {
                console.log(`Error sending OTP email: ${err}`);
                reject(err);
            });
        } catch(err) {
            console.log(`Error sending email: ${err.message}`);

        }
        
    });
};

/* function that generates an OTP password */

// Generate OTP
function generateOTP() {
    return randomstring.generate({
      length: OTP_CODE_SIZE,
      charset: 'numeric'
    });
  }

module.exports = () => { 
    
    /* generate a pool of mysql connection  */
    var con = mysql2.createPool(defaultMySQLDBConnectorConfig);

    
    router.get('/', csrfProtection, async(request, response) => { 
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
       
         
        var userCart = {} ;

        //console.log(`user ${request.session.user} userCart ${request.session.userCart}`);
        //check if user is logged in
        var user = request.session.user;
        if (user ) {
            user = JSON.parse(JSON.stringify(request.session.user)) ;
            //console.log(`user : ${JSON.stringify(user)}, current session : ${JSON.stringify(request.session)}`);
            //return response.status(401).send(`You are already logged in as ${user.email}`);
            response.status(200).send(
                `You are already logged in as ${user.email}\n
                Click <a href="/logout">here</a> to logout\n<br>
                Click <a href="/admin">here</a> to head to your dashboard\n<br>`
            );
            return ;
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
            IMG_DIR_FOR_WEB : request.session.IMG_DIR_FOR_WEB,
            categories: categories,
            user: user,
            decode:decode,
            encode:encode
        });
    });

    
    router.post('/', csrfProtection,loginCheckOutValidation, async(request, response) => {
         //check if user is logged in
        var user = request.session.user;
        if (user) {
            //not supposed to happen
            user = JSON.parse(JSON.stringify(request.session.user)) ;
            //console.log(`user : ${JSON.stringify(user)}, current session : ${JSON.stringify(request.session)}`);
            return response.status(401).send(`You are already logged in as ${user.email}`);
        } ;

        user = {} ;
        
        const email = new String(request.body.email).trim();
        const password = new String(request.body.password).trim();
        
        //validate email
        const emailValidation =  await isEmailValid(email) ;
        //console.log(`email validation : ${JSON.stringify(emailValidation)}`);
        if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(email)) {
            //email is not valid
            response.status(400).send(`Something wrong with your form.`); 
            //console.log(`bad email validation test`);
           return ;
        };
        //console.log(`email: ${email} password: ${password}`);
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing login form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            
            response.status(500).send(`${err_message}`);
            return ;
        }     
        
                
        // Check if user exists
        con.execute('SELECT * FROM users WHERE email = ? ', [email], async(err, results) => {
            if (err) {
                console.log(`Error processing login form: ${err}`);
                response.status(500).send('Internal server error');
                return ;
            } else if (results.length === 0) {
                response.status(400).send('Oops! Login did not seem to work');
                return ;
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
                        VALUES (id, ?, ?, NOW() + INTERVAL 15 MINUTE)',
                      [user.email, otp], (err, results) => {
                    if (err) {
                        response.status(500).send('Internal Server Error');
                        return 
                    }

                    // Send OTP via email
                    try {
                        sendOTP(user.email, otp);
                        response.status(200).send(`Login was successful. <br/>
                        Please check your email and verify your one time password`);
                        return;
                    } catch (error) {
                        console.log(`Error : ${error}`);
                        response.send({
                            message:'error',
                            responseText:`An error occured while sending email otp email`
                        });
                    } ;
                    
                });
            } else {
                response.status(404).send('Ouch! login was invalid');
                return

            } ;
        });
    });


    return router;
};


