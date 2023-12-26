const express = require('express');
const router = express.Router();




const bodyParser = require('body-parser');
var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const cookieSession = require('cookie-session');
var parseForm = bodyParser.urlencoded({ extended: true });

module.exports = () => {
        
    router.get('/',  csrfProtection, async (request, response) => { 
        
        
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'product-list',
            list_of_items : request.locals.list_of_items,
            category: 'Individual Party Rental Items',
            csrfToken: request.csrfToken()
        }); 
    });
    return router;
};



