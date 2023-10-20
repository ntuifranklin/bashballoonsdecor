const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Our Party Rental Inventory', template: 'shop'});
    });
     


    return router;
};

