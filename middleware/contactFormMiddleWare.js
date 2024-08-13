

const {validationResult} = require('express-validator');
const {VALID_EMAIL_REGEXP,isEmailValid} = require('../utilities/email');

const {
    safeAgainstSqlAndShellInjection,
    isValidPhoneNumber,
    isValidTextMessage
} = require('../utilities/functions');

 //Middleware to check for validation errors
const validateContactForm = async(request, response, next) => {

    /* Process form */
    const name = new String(request.body.name);
    const email = new String(request.body.email);
    const comment = new String(request.body.comment);
    const phone = new String(request.body.phone);

    //validate email
    const emailValidation = await isEmailValid(email) ;
    //console.log(`email validation : ${JSON.stringify(emailValidation)}`);
    if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(email)) {
        //email is not valid
        return response.status(400).send(`Something wrong with your email.`); 
        
    };
    
    const validName = isValidTextMessage(name) && safeAgainstSqlAndShellInjection(name);
    const validPhone = isValidPhoneNumber(phone) ;
    const validComment= isValidTextMessage(comment) && safeAgainstSqlAndShellInjection(comment);
    if ( !validName ) {
        return response.status(400).send(`Something wrong with your full name.`); 
        
    } ;
    if (!validPhone) {
        return response.status(400).send(`Something wrong with the phone number.`); 
        
    } ;
    if (!validComment) {
        return response.status(400).send(`Something wrong with your message.`); 
        
    } ;
    /* Begin sanitize from data here */
    const formerrors = validationResult(request);
    if (!formerrors.isEmpty()) {
        const err_message = formerrors.array().map(i => i.msg).join('<br>');
        //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
        return response.status(400).send(`${err_message}`); 
        
    } ;

    next();
};
exports.validateContactForm = validateContactForm ;

