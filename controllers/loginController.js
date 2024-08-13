
require('dotenv').config();

const {mysqlpassword} = require('../database/controllers/database');

var mysql2 = require('mysql2');
const {decode,encode} = require('html-entities');
const {sendOTP,generateOTP} = require('../utilities/email');

const { defaultMySQLDBConnectorConfig } = require('../database/models/MySQLDBConnector');

const {
    ADMIN_ROUTE,
    LOGOUT_ROUTE
} = require('../utilities/routes_constant_names');

const {CATEGORIES_TABLE,USER_CART, USER} = require('../utilities/web_page_variables');

const {IMG_DIR_FOR_WEB} = require('../utilities/fileupload');

const showLoginPage = async(request, response) => { 

    var app_cache = request.locals.app_cache ;
    
    var categories = app_cache.get(CATEGORIES_TABLE); 
    categories= await JSON.parse(JSON.stringify(categories));

    var userCart = {} ;

    var user = {};
    if (app_cache.has(USER) ) {
        user = JSON.parse(JSON.stringify(app_cache.get(USER))) ;
        

    } ;
    user = JSON.parse(JSON.stringify(user));

    
    if (app_cache.has(USER_CART))
        userCart = JSON.parse(JSON.stringify(app_cache.get(USER_CART))) ;
    userCart = JSON.parse(JSON.stringify(userCart));
    //console.log('User Cart in cart.js: ' + JSON.stringify(userCart, null, 4));
    response.render('layout', { 
        pageTitle: 'Login Page', 
        template: 'login', 
        userCart: userCart,
        csrfToken: request.csrfToken(),
        IMG_DIR_FOR_WEB : IMG_DIR_FOR_WEB,
        categories: categories,
        user: user,
        decode:decode,
        encode:encode
    });
} ;

const loginPost = async(request, response) => {
    
    /* generate a pool of mysql connection  */
   var con = mysql2.createPool(defaultMySQLDBConnectorConfig);

   const email = new String(request.body.email).trim();
   const password = new String(request.body.password).trim();

   
           
   // Check if user exists
   con.execute('SELECT * FROM users WHERE email = ? ', [email], async(err, results) => {
       if (err) {
           console.log(`Error processing login form: ${err}`);
           return response.status(500).send('Internal server error');
           
       } else if (results.length === 0) {
            console.log(`results : ${JSON.stringify(results)}`);
            return response.status(400).send('Oops! Login did not seem to work');
           
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
                   return response.status(500).send('Internal Server Error');
                   
               }

               // Send OTP via email
               try {
                   sendOTP(user.email, otp);
                   return response.status(200).send(`Login was successful. <br/>
                   Please check your email and verify your one time password`);
                   
               } catch (error) {
                   console.log(`Error : ${error}`);
                   return response.status(400).send({
                       message:'error',
                       responseText:`An error occured while sending email otp email`
                   });
               } ;
               
           });
       } else {
           return response.status(400).send('Ouch! login was invalid');
           

       } ;
   });
}
module.exports = {
    showLoginPage,
    loginPost
};