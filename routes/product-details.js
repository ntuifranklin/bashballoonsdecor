const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });

module.exports = () => { 
    
    router.get('/',  csrfProtection, (request, response) => { 
        response.render('layout', { 
            pageTitle: 'Details of Product with title BlaBlaBla', 
            template: 'product-details',
            csrfToken: request.csrfToken()
        });
    });


    return router;
    
};
