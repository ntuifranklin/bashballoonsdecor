

const {VALID_EMAIL_REGEXP, isEmailValid} = require('../utilities/email');

const {validationResult } = require('express-validator');



const checkLoginForm = async(request,response, next) => {
    
   
   const email = new String(request.body.email).trim();
   
   //validate email
   const emailValidation =  await isEmailValid(email) ;
   //console.log(`email validation : ${JSON.stringify(emailValidation)}`);
   if (!emailValidation && !emailValidation.valid && emailValidation.valid === false && !VALID_EMAIL_REGEXP.test(email)) {
       //email is not valid
       return response.status(400).send(`Something wrong with your form.`); 
       //console.log(`bad email validation test`);
   };
   //console.log(`email: ${email} password: ${password}`);
   const formerrors = validationResult(request);
   if (!formerrors.isEmpty()) {
       const err_message = formerrors.array().map(i => i.msg).join('<br>');
       //console.log(`Error processing login form: ${JSON.stringify(formerrors.array(), null, 4)}`);
       
       return response.status(500).send(`${err_message}`);
       
   }   ;
   next();  
   

} ;

exports.checkLoginForm = checkLoginForm ;
