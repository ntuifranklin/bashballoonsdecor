const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })
const { check,validationResult } = require('express-validator');

require('dotenv').config();
const {isEmailValid,VALID_EMAIL_REGEXP} = require('../utilities/email');
const {OTP_CODE_SIZE} = require('../utilities/functions');
const {MySQLDBConnector, defaultMySQLDBConnectorConfig} = require('../database/models/MySQLDBConnector');
const {isValidOTPCode} = require('../utilities/functions');
const verifyOTPcheckOutValidation = [
    check('user_email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    check('otp').isLength({ min: 1, max:OTP_CODE_SIZE }).isNumeric().withMessage('Please enter your One Time Password'),
];

module.exports = () => { 
    
    /* generate a pool of mysql connection  */
    const mysqlDbConnector = MySQLDBConnector ;
    
    
    router.post('/', csrfProtection,verifyOTPcheckOutValidation, async(request, response) => {
        
            const user_email = new String(request.body.user_email).trim();
            const otp = new String(request.body.otp).trim();
        
            //validate email
            const emailValidation = await isEmailValid(user_email) ;
            const otpIsValid = isValidOTPCode(otp) ;
            
            //console.log(`email validation : ${JSON.stringify(emailValidation)}`);
            if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(user_email)) {
                //email is not valid
                response.status(400).send(`Something wrong with your email.`); 
                //console.log(`bad email validation test`);
               return ;
            };
            if (otpIsValid == null || !otpIsValid) {
                response.status(400).send(`Something wrong with your otp code.`); 
                return ;
            } ;
            try {
                // Verify OTP
                const verify_otp_query = "SELECT * FROM otp WHERE user_email = ? AND otp_code = ? AND expiration_time >= NOW()";
                const otp_results = await mysqlDbConnector.execute(verify_otp_query, [user_email, otp]) ;
                const delete_otp_query = "DELETE FROM otp WHERE user_email = ? ";
                const delete_old_otp = await mysqlDbConnector.execute(delete_otp_query, [user_email]);
                console.log(`otp success user_email: ${user_email}`);
                request.session.user = {
                    email: `${user_email}`,
                    password: null,
                    authenticated: true
                } ;

                request.session.save();
        
                response.status(200).send(`OTP successfully verified\n<br/>
                You are logged in as ${user_email}\n<br/>
                <a href="/admin">Click here to head to your dashboard</a>\n <br/>
                or <br/>
                <a href="/logout"> Click here to logout</a> \n<br>`);
                
            } catch(err) {
                console.log(err);
                response.status(400).send({
                    message:'error',
                    responseText:`An Error Occured while verifying the one time 
                    password for the user_email: ${user_email}`
                });
                
            }
                
        
    });

    return router;
};


