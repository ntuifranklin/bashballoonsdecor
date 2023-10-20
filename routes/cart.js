const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Your Cart Items', template: 'cart'});
    });
     


    return router;
};

