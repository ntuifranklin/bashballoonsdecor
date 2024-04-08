const express = require('express');
const { decode,encode } = require('html-entities');
const router = express.Router();
const {Email} = require('../utilities/email');

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });
const { check,validationResult } = require('express-validator');
const {VALID_EMAIL_REGEXP} = require('../utilities/email');
const validEmailRegExp = VALID_EMAIL_REGEXP ;
const contactFormValidation = [
    check('name').isLength({ min: 5, max:255 }).withMessage('Please enter your name.'),
    check('email').matches(validEmailRegExp).withMessage('Please enter a valid email address.'),
    check('comment').isLength({ min: 5, max:255 }).withMessage('Please a message.'),
    check('phone').isLength({ min: 5, max:16 }).withMessage('Please enter your phone number.'),
];

/* For caching data to increase speed */
const NodeCache = require( "node-cache" );
const cache = new NodeCache();

module.exports = () => { 
    
    router.get('/', csrfProtection, async(request, response) => { 
        
        var categories = cache.get('categories');
        if (!categories) {
            categories = await JSON.parse(JSON.stringify(request.session.categories));
            cache.set('categories', categories);
        }
         
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = await JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        response.render('layout', { 
            pageTitle: 'Contact Us', 
            template: 'contact',
            csrfToken: request.csrfToken(),
            userCart: userCart,
            categories: categories,
            decode:decode,
            encode:encode,
        });
    });
    
    router.post('/',  contactFormValidation, csrfProtection,async(request, response) => {         
        /* Process form */
        const name = new String(request.body.name);
        const email = new String(request.body.email);
        const comment = new String(request.body.comment);
        const phone = new String(request.body.phone);

        /* Begin sanitize from data here */
        const formerrors = validationResult(request);
        if (!formerrors.isEmpty()) {
            const err_message = formerrors.array().map(i => i.msg).join('<br>');
            //console.log(`Error processing form: ${JSON.stringify(formerrors.array(), null, 4)}`);
            return response.status(400).send(`${err_message}`); 
            
        } ;
        /* send the email */
        var emailSender = new Email();
        const emailObject = {
            to: process.env.BCC_ORDER_EMAIL,
            subject: `Contact form from ${name} with email: ${email}`,
            html: `${comment}`,
        } ;
        emailSender.sendEmail(emailObject.to, emailObject.subject, emailObject.html).
        then((result) => {
            console.log(`Email sent: ${result}`);
            return response.status(200).send(`Message sent successfully`);
        }).
        catch((err) => {
            console.log(`Error occured sending email: ${err}`);
            return response.status(400).send(`An Error Occured while sending the email.`);
        });
        
        
    });
     


    return router;
};

