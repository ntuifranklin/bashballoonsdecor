
const {
    safeAgainstSqlAndShellInjection,
    isValidPhoneNumber,
    isValidTextMessage
} = require('../utilities/functions');


const { v4: uuidv4 } = require('uuid');
const { check,validationResult } = require('express-validator');
const checkoutFormValidator = async(request, response, next) => {
    var app_cache = request.locals.app_cache ;
    if (typeof request.session.userCart === "undefined" || request.session.userCart == undefined || Object.keys(request.session.userCart).length === 0 || !request.session.userCart || request.session.userCart == {} || request.session.userCart == null ) {
        response.redirect(200, '/');
        response.end(); 
    };

    var userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
    
   /* Get form data first, and sanitize or reject if necessary */
   const completename = new String(request.body.completename);
   const email = new String(request.body.email) ;
   const city = new String(request.body.city) ;
   const state = new String(request.body.state) ;
   const zipcode = new String(request.body.zipcode) ;
   const phone = new String(request.body.phone) ; 
   const street_address = new String(request.body.street_address) ;
   const order_note = new String(request.body.order_note);
    //Check email is valid
    
    const emailValidation = await isEmailValid(email) ;
    if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(email)) {
        //email is not valid
        return response.status(400).send(`Something wrong with your form.`); 
        //console.log(`bad email validation test`);
         ; 
    };
     //============================================
    /* Begin sanitize from data here */
    const formerrors = validationResult(request);
    if (!formerrors.isEmpty()) {
        const err_message = formerrors.array().map(i => i.msg).join('<br>');
        //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
        return response.status(400).send(`${err_message}`); 
         ; 
        
    };
    /* End Sanitize form data  */
    //============================================
    //check if any bad characters are within the order_note
   
    const validCompleteName = isValidTextMessage(completename) && safeAgainstSqlAndShellInjection(completename);
    const validStreetAddress = isValidTextMessage(street_address) &&  safeAgainstSqlAndShellInjection(street_address);
    const validCity = isValidTextMessage(city) && safeAgainstSqlAndShellInjection(city);
    const validState = isValidTextMessage(state) && safeAgainstSqlAndShellInjection(state);
    const validZipCode = isValidTextMessage(zipcode) && safeAgainstSqlAndShellInjection(zipcode);
    const validPhone = isValidPhoneNumber(phone) ;
    const validOrderNote= isValidTextMessage(order_note) && safeAgainstSqlAndShellInjection(order_note);
   
    if (!validCompleteName) {
        return  response.status(400).send(`Please check the name entered`); 
        ; 
    } ;
    
    if (!validStreetAddress) {
        return  response.status(400).send(`Please check the street address`); 
        ; 
    } ;
    if (!validCity) {
        return  response.status(400).send(`Please check the city entered`); 
        ; 
    } ;
    if (!validState) {
        return  response.status(400).send(`Please check the state.`); 
        ; 
    } ;
    if (!validZipCode) {
        return  response.status(400).send(`Please check the zip code`); 
        ; 
    } ;
    if (!validPhone) {
        return response.status(400).send(`Please check the phone number.`); 
        ; 
    } ;
    if (!validState) {
        return response.status(400).send(`Please check the state.`); 
        ; 
    } ;
    if (!validOrderNote) {
        return response.status(400).send(`Please check the order note`); 
       
    } ;
    next();
} ;


exports.checkoutFormValidator = checkoutFormValidator ;