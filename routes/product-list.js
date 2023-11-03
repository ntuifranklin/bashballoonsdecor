const express = require('express');
const router = express.Router();

const databaseAccessor = require('../database/controllers/database');

try {
   
    module.exports = () => {
        
        router.get('/', async (request, response) => { 
            const list_of_items = await databaseAccessor.getIndividualItems();
            
            response.render('layout', { 
                pageTitle: 'Individual Items | Individual Products', 
                template: 'product-list',
                list_of_items : list_of_items,
                category: 'Individual Party Rental Items',
            }); 
        });
        return router;
    };
} catch(err) {
    console.log(err);
}


module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Available Items', template: 'product-list'});
    });


    return router;
};

