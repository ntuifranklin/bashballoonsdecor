const express = require('express');
const router = express.Router();






module.exports = () => {
        
    router.get('/', async (request, response) => { 
        
        
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



