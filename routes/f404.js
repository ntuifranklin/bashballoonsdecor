const express = require('express');
const router = express.Router();

var csrf = require('csurf');
// csrf protection
var csrfProtection = csrf({ cookie: true });
const {decode,encode} = require('html-entities');


module.exports = () => { 
    
    router.get('/*', csrfProtection, async(request, response) => { 
        
        var userCart = {} ;
        if (request.session.userCart)
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        
        
        var categories = await JSON.parse(JSON.stringify(request.session.categories));
       
        response.status(404).render('layout', 
        { 
            pageTitle: 'Sorry We Could Not Find What You Are Looking For', 
            template: 'f404',
            category_items: categories,
            userCart: userCart, 
            categories: categories,
            csrfToken: request.csrfToken(),
            decode: decode,
            encode:encode
        });
    });
     


    return router;
};

