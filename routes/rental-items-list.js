const express = require('express');
const router = express.Router();






module.exports = () => {
        
    router.get('/', async (request, response) => { 
        
        var categories = request.session.categories;
        var category_items = request.session.categoriesItemsHash;
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'rental-items-list',
            category_items: category_items,
            list_of_items : request.locals.list_of_items,
            category: 'Individual Party Rental Items',
            csrfToken: request.csrfToken(),
            categories: categories,
        }); 
    });
    return router;
};



