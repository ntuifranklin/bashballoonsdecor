const express = require('express');
const router = express.Router();
module.exports = () => { 
        
    router.get('/', (request, response) => { 
        response.render('layout', { pageTitle: 'Welcome', template: 'index'});
    });
     
    

    return router;
};

