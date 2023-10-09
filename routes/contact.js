const express = require('express');
const router = express.Router();

module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Contact Us', template: 'contact'});
    });
     


    return router;
};

