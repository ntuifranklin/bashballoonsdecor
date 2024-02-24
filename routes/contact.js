const express = require('express');
const { decode } = require('html-entities');
const router = express.Router();



module.exports = () => { 
    
    router.get('/',  (request, response) => { 
        var categories = request.session.categories;
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        response.render('layout', { 
            pageTitle: 'Contact Us', 
            template: 'contact',
            csrfToken: request.csrfToken(),
            userCart: userCart,
            categories: categories,
            decode:decode,
        });
    });
     


    return router;
};

