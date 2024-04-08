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
const {Email} = require('../utilities/email');
const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');

const verifyOTPcheckOutValidation = [
    check('user_email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('otp').isLength({ min: 1 }).withMessage('Please enter your One Time Password'),
];

module.exports = () => { 
    
    /* generate a pool of mysql connection  */
    const mysqlDbConnector = MySQLDBConnector ;
    
    
    router.post('/', csrfProtection,verifyOTPcheckOutValidation, async(request, response) => {
        
            const user_email = new String(request.body.user_email).trim();
            const otp = new String(request.body.otp).trim();
        
            try {
                // Verify OTP
                const verify_otp_query = "SELECT * FROM otp WHERE user_email = ? AND otp_code = ? AND expiration_time >= NOW()";
                const otp_results = await mysqlDbConnector.execute(verify_otp_query, [user_email, otp]) ;
                const delete_otp_query = "DELETE FROM otp WHERE user_email = ?";
                const delete_old_otp = await mysqlDbConnector.execute(delete_otp_query, [user_email]);
                request.session.user = {
                    email: user_email,
                    password: null,
                    authenticated: true
                } ;

                request.session.save();
        
                return response.status(200).send(
                    `OTP successfully verified\n<br/>
                    You are logged in as ${user_email}\n<br/>
                    <a href="/admin">Click here to head to your dashboard</a>\n <br/>
                    or <br/>
                    <a href="/logout"> Click here to logout</a> \n<br>`
                );
            } catch(err) {
                console.log(err);
                return response.status(400).send('An Error Occure');
            }
                
        
    });

    return router;
};


