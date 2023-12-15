const express = require('express');
const router = express.Router();

const databaseAccessor = require('../database/controllers/database');

module.exports = () => {
        
    router.get('/', async (request, response) => { 
        const list_of_items = await databaseAccessor.getIndividualItems();
        
        response.render('layout', { 
            pageTitle: 'Individual Items | Individual Products', 
            template: 'product-list',
            list_of_items : request.locals.list_of_items,
            category: 'Individual Party Rental Items',
        }); 
    });
    return router;
};



