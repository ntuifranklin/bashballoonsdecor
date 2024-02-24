const express = require('express');
const router = express.Router();
const {decode} = require('html-entities');

module.exports = () => {
        
    router.get('/', async (request, response) => { 
        var userCart = {} ;
        if (request.session.userCart) {
            userCart = JSON.parse(JSON.stringify(request.session.userCart)) ;
        };
        var categories = request.session.categories;
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'rental-items-list',
            //list_of_items : request.locals.list_of_items,
            category: 'Individual Party Rental Items',
            csrfToken: request.csrfToken(),
            categories: categories,
            userCart: userCart,
            decode: decode,
        }); 
    });
    return router;
};



