
require('dotenv').config();
const {isEmailValid,VALID_EMAIL_REGEXP} = require('../utilities/email');
const {isValidOTPCode} = require('../utilities/functions');
const {USER} = require('../utilities/web_page_variables');
const {ADMIN_ROUTE, LOGOUT_ROUTE } = require('../utilities/routes_constant_names');
const {writeDataToRedisCache} = require('../middleware/redis');
/* generate a pool of mysql connection  */
const {MySQLDBConnector} = require('../database/models/MySQLDBConnector');
const mysqlDbConnector = MySQLDBConnector ;

const verifyPagePost =  async(request, response) => {
        
    const user_email = new String(request.body.user_email).trim();
    const otp = new String(request.body.otp).trim();

    //validate email
    const emailValidation = await isEmailValid(user_email) ;
    const otpIsValid = isValidOTPCode(otp) ;
    
    //console.log(`email validation : ${JSON.stringify(emailValidation)}`);
    if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(user_email)) {
        //email is not valid
        return response.status(400).send(`Something wrong with your email.`); 
        //console.log(`bad email validation test`);
       
    };
    if (otpIsValid == null || !otpIsValid) {
        return response.status(400).send(`Something wrong with your otp code.`); 
        
    } ;
    try {
        // Verify OTP
        const verify_otp_query = "SELECT * FROM otp WHERE user_email = \"?\" AND otp_code = ? AND expiration_time >= NOW()";
        const otp_results = await mysqlDbConnector.execute(verify_otp_query, [user_email, otp]) ;
        const delete_otp_query = "DELETE FROM otp WHERE user_email = \"?\" ";
        const delete_old_otp = await mysqlDbConnector.execute(delete_otp_query, [user_email]);
        //console.log(`otp success user_email: ${user_email}`);
        var loggedIntime = Date.now() / 1000 ; //number of seconds since jan-01-1970
        const loggedInUser = {
            email: `${user_email}`,
            password: null,
            authenticated: true,
            loggedIntime: loggedIntime,
        } ;
        const userStringedData = JSON.stringify(loggedInUser);
                
        const USER_REDIS_CACHING_OPTIONS = 
        {
            
            EX: process.env.ADMIN_USER_EXPIRE_TIME, // 15 minutes. User has to log in every 15 minutes
            
            //set to true implies write the data even if the key already exists, meaning overriding the user's data in cache
            // if set to false, then user will never stay logged in.
            NX: false, 
        } ;
        const key =  request.locals.LOGGEDIN_USER_VARIABLE_NAME;
        await writeDataToRedisCache(key, userStringedData, USER_REDIS_CACHING_OPTIONS);
        request.locals.USER = userStringedData ;
        console.log(`otp success user_email: ${userStringedData}`);
        return response.status(200).send(`OTP successfully verified\n<br/>
        You are logged in as ${user_email}\n<br/>
        <a href="/${ADMIN_ROUTE}">Click here to head to your dashboard</a>\n <br/>
        or <br/>
        <a href="/${LOGOUT_ROUTE}"> Click here to logout</a> \n<br>`);
        
    } catch(err) {
        console.log(err);
        return response.status(400).send({
            message:'error',
            responseText:`An Error Occured while verifying the one time 
            password for the user_email: ${user_email}`
        });
        
    } ;
        

} ;

exports.verifyPagePost = verifyPagePost ;