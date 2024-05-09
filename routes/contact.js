const express = require('express');
const { decode,encode } = require('html-entities');
const router = express.Router();
const {Email} = require('../utilities/email');
const {
    safeAgainstSqlAndShellInjection,
    isValidPhoneNumber,
    isValidTextMessage
} = require('../utilities/functions');
const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });
const { check,validationResult } = require('express-validator');
const {VALID_EMAIL_REGEXP, MAX_EMAIL_ADDR_LENGTH,isEmailValid} = require('../utilities/email');
const {Fisl, MAX_BUFFER_SIZE,DEFAULT_BUFFER_TYPE} = require('../utilities/Fisl');
const validEmailRegExp = VALID_EMAIL_REGEXP ;

const contactFormValidation = [
    check('name').isLength({ min: 5, max:255 }).withMessage('Please enter your name.'),
    check('email').isLength({min:6, max:MAX_EMAIL_ADDR_LENGTH}).matches(validEmailRegExp).withMessage('Please enter a valid email address.'),
    check('comment').isLength({ min: 5, max:255 }).withMessage('Please a message.'),
    check('phone').isLength({ min: 5, max:16 }).withMessage('Please enter your phone number.'),
];


module.exports = () => { 
    
    router.get('/', csrfProtection, async(request, response) => { 
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
        
        var user = {} ;
        if (request.session.user && request.session.user.email)
            user = JSON.parse(JSON.stringify(request.session.user)) ;
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        response.render('layout', { 
            pageTitle: 'Contact Us', 
            template: 'contact',
            csrfToken: request.csrfToken(),
            userCart: userCart,
            user:user,
            categories: categories,
            decode:decode,
            encode:encode,
        });
    });
    
    router.post('/',  contactFormValidation, csrfProtection,async(request, response) => {    
        /* Use buffers to prevent buffer overflow  */
        /*
        const fislName = new Fisl() ;   
        fislName.overLoadConstructor(MAX_BUFFER_SIZE, request.body.name, DEFAULT_BUFFER_TYPE); 
        const fislEmail = new Fisl() ;   
        fislEmail.overLoadConstructor(MAX_EMAIL_ADDR_LENGTH, request.body.email, DEFAULT_BUFFER_TYPE);  
        const fislComment = new Fisl() ;   
        fislComment.overLoadConstructor(MAX_BUFFER_SIZE, request.body.comment, DEFAULT_BUFFER_TYPE);  
        const fislPhone = new Fisl() ;   
        fislPhone.overLoadConstructor(MAX_BUFFER_SIZE, request.body.phone, DEFAULT_BUFFER_TYPE);   
        
        
        const name = fislName.toString();
        const email = fislEmail.toString();
        const comment = fislComment.toString();
        const phone = fislPhone.toString();
        */
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
            response.status(400).send(`Something wrong with your email.`); 
            //console.log(`bad email validation test`);
            return ;
        };
        
        const validName = isValidTextMessage(name) && safeAgainstSqlAndShellInjection(name);
        const validPhone = isValidPhoneNumber(phone) ;
        const validComment= isValidTextMessage(comment) && safeAgainstSqlAndShellInjection(comment);
        if ( !validName ) {
            response.status(400).send(`Something wrong with your full name.`); 
           return ;
        } ;
        if (!validPhone) {
            response.status(400).send(`Something wrong with the phone number.`); 
           return ;
        } ;
        if (!validComment) {
            response.status(400).send(`Something wrong with your message.`); 
           return ;
        } ;
        /* Begin sanitize from data here */
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            response.status(400).send(`${err_message}`); 
           return ;
            
        } ;
        /* send the email */
        var emailSender = new Email();
        const emailObject = {
            to: process.env.BCC_ORDER_EMAIL,
            subject: `Contact form from ${name} with email: ${email}`,
            html: `
            Customer Details : <br/>\n
            Full Name : ${name} <br/>\n
            Email Address : ${email} <br/>\n
            Phone : ${phone} <br/>\n
            Message: ${comment}<br/>\n`,
        } ;
        emailSender.sendEmail(emailObject.to, emailObject.subject, emailObject.html).
        then((result) => {
            console.log(`Email sent: ${result}`);
            response.status(200).send(`Message sent successfully`);
            return ;
        }).
        catch((err) => {
            console.log(`Error occured sending email: ${err}`);
            response.status(400).send(`An Error Occured while sending the email.`);
            return ;
        });
        
        
    });
     


    return router;
};

