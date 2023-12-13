const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Details of Product with title BlaBlaBla', template: 'product-details'});
    });


    return router;
};
