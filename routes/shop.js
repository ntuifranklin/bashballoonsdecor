const express = require('express');
const router = express.Router();
const {decode, encode} = require('html-entities');
module.exports = () => { 
    
    router.get('/', (request, response) => { 
        response.render('layout', { 
            pageTitle: 'Our Party Rental Inventory', 
            template: 'shop',
            csrfToken: request.csrfToken(),
            decode: decode,
            encode: encode
        });
    });
     


    return router;
};

